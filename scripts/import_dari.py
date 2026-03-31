#!/usr/bin/env python3
"""
Batch Dari Translation Importer
Parses Dari .docx files containing Arabic verses + Dari translations
and updates the SQLite database.

Handles three docx format variations:
  1. ﴿N﴾ format: Arabic with ornamental brackets, Dari with (N)
  2. Separate lines: Arabic (N) on one line, Dari (N) on next
  3. Same line: Arabic (N) Dari (N) combined

Usage:
    python3 scripts/import_dari.py --dir quran/ --db assets/db/quran.db
"""

from __future__ import annotations

import argparse
import re
import sqlite3
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Optional

# ─────────────────────────────────────────────────────────────────────────────
# Numeral conversion
# ─────────────────────────────────────────────────────────────────────────────
ARABIC_INDIC = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")
EXTENDED_ARABIC_INDIC = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")

def normalize_number(s: str) -> str:
    return s.translate(ARABIC_INDIC).translate(EXTENDED_ARABIC_INDIC)

# ─────────────────────────────────────────────────────────────────────────────
# Regex patterns
# ─────────────────────────────────────────────────────────────────────────────
# Ornamental Quranic brackets ﴿N﴾
ORNAMENTAL_RE = re.compile(r"﴿([۰-۹٠-٩0-9]+)﴾")
# Parenthetical verse number (N) — digits only, with optional spaces/ZWJ inside
PAREN_RE = re.compile(
    r"[\(（][\u200B-\u200F\u200C\u200D\s]*([۰-۹٠-٩0-9]+)[\u200B-\u200F\u200C\u200D\s]*[\)）]"
)
# Footer patterns to skip
FOOTER_RE = re.compile(r"صدق الله|و من الله التوفيق")
# Arabic diacritics (tashkeel) — for stripping before text comparison
TASHKEEL_RE = re.compile(r"[\u0610-\u061A\u064B-\u065F\u0670]")

def strip_tashkeel(s: str) -> str:
    """Remove Arabic diacritical marks for plain text comparison."""
    return TASHKEEL_RE.sub("", s)

# ─────────────────────────────────────────────────────────────────────────────
# Docx paragraph extraction
# ─────────────────────────────────────────────────────────────────────────────
def extract_paragraphs(docx_path: str) -> list[str]:
    NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    paras: list[str] = []
    with zipfile.ZipFile(docx_path) as z:
        with z.open("word/document.xml") as f:
            tree = ET.parse(f)
            root = tree.getroot()
            body = root.find(f"{{{NS}}}body")
            if body is None:
                raise ValueError("Malformed docx: no <w:body> found")
            for p in body.findall(f"{{{NS}}}p"):
                runs = p.findall(f".//{{{NS}}}t")
                text = "".join(r.text or "" for r in runs).strip()
                if text:
                    paras.append(text)
    return paras


# ─────────────────────────────────────────────────────────────────────────────
# Core parser: marker-based segmentation
# ─────────────────────────────────────────────────────────────────────────────
def find_markers(text: str) -> list[tuple[int, int, int, str]]:
    """
    Find all verse-number markers in text.
    Returns list of (start, end, verse_num, type) sorted by position.
    type is 'ornamental' for ﴿N﴾ or 'paren' for (N).
    """
    markers = []
    for m in ORNAMENTAL_RE.finditer(text):
        num = int(normalize_number(m.group(1)))
        markers.append((m.start(), m.end(), num, "ornamental"))
    for m in PAREN_RE.finditer(text):
        num = int(normalize_number(m.group(1)))
        markers.append((m.start(), m.end(), num, "paren"))
    markers.sort(key=lambda x: x[0])
    return markers


def parse_dari_verses(paragraphs: list[str]) -> list[dict]:
    """
    Parse Arabic + Dari verse pairs from paragraphs.

    Algorithm:
    1. Skip header lines (surah name, info) and bismillah
    2. Join remaining text
    3. Find all verse-number markers (﴿N﴾ and (N))
    4. Markers come in pairs per verse: first = end of Arabic, second = end of Dari
    5. Extract text segments between markers
    """
    verses = []

    # ── Detect and extract Bismillah ─────────────────────────────────────
    content_start = 0
    bismillah_arabic = ""
    bismillah_dari = ""

    for i, para in enumerate(paragraphs):
        # Skip surah name / info lines (no verse markers, before bismillah)
        plain = strip_tashkeel(para)
        if "بسم" in plain and "الله" in plain and "الرحمن" in plain:
            bismillah_arabic = para
            # Next line is typically the Dari bismillah translation
            if i + 1 < len(paragraphs) and not ORNAMENTAL_RE.search(paragraphs[i + 1]):
                next_para = paragraphs[i + 1]
                # Make sure it's not a verse (no markers)
                if not PAREN_RE.search(next_para) or "به نام" in next_para:
                    bismillah_dari = next_para
                    content_start = i + 2
                else:
                    content_start = i + 1
            else:
                content_start = i + 1
            break
        content_start = i + 1

    # If no bismillah found (e.g., Surah At-Tawba), start from the beginning
    if not bismillah_arabic:
        content_start = 0

    if bismillah_arabic:
        verses.append({
            "verse_number": 0,
            "arabic": bismillah_arabic,
            "dari": bismillah_dari,
        })

    # ── Skip info/header lines until first verse paragraph ─────────────
    # Info lines like "سورۀ بقره دارای (286) آیت..." contain numbers in
    # parentheses that would be false-positive verse markers.
    INFO_WORDS = re.compile(r"آيت|آیت|رکوع|نازل شده|كلمه|کلمه|حرف")
    first_verse_idx = content_start
    for j in range(content_start, len(paragraphs)):
        para = paragraphs[j]
        if FOOTER_RE.search(para):
            break
        if ORNAMENTAL_RE.search(para):
            first_verse_idx = j
            break
        # For (N) format: check for small verse numbers (1-3) that look like real markers
        paren_matches = list(PAREN_RE.finditer(para))
        if paren_matches and not INFO_WORDS.search(para):
            nums = [int(normalize_number(m.group(1))) for m in paren_matches]
            if any(n <= 3 for n in nums):
                first_verse_idx = j
                break
    else:
        first_verse_idx = content_start

    # ── Join remaining paragraphs, skip footers ──────────────────────────
    content_paras = []
    for para in paragraphs[first_verse_idx:]:
        if FOOTER_RE.search(para):
            break
        content_paras.append(para)

    if not content_paras:
        return verses

    full_text = "\n".join(content_paras)

    # ── Find all markers ─────────────────────────────────────────────────
    markers = find_markers(full_text)
    if not markers:
        print("    WARNING: No verse markers found!")
        return verses

    # Filter out unreasonable marker numbers (likely from info text)
    max_verse = max(m[2] for m in markers if m[2] <= 300) if markers else 300
    markers = [m for m in markers if m[2] <= max_verse]

    # ── Extract blocks: text between consecutive markers ───────────────
    # Each marker terminates a "block" of text. The marker type tells us
    # whether the block is Arabic (ornamental ﴿N﴾) or Dari (paren (N)).
    #
    # Two strategies depending on file format:
    # A) Files with ornamental markers: ornamental = Arabic, paren = Dari
    # B) Paren-only files: two (N) per verse, first = Arabic, second = Dari

    has_ornamental = any(m[3] == "ornamental" for m in markers)

    if has_ornamental:
        # ── Strategy A: block-based extraction ────────────────────────
        # Each marker ends a block. Collect blocks by verse number.
        arabic_blocks: dict[int, list[str]] = {}
        dari_blocks: dict[int, list[str]] = {}

        prev_end = 0
        for m_start, m_end, m_num, m_type in markers:
            block_text = full_text[prev_end:m_start].strip()
            block_text = re.sub(r"\s*\n\s*", " ", block_text).strip()
            # Clean stray markers from block text
            block_text = ORNAMENTAL_RE.sub("", block_text).strip()
            block_text = PAREN_RE.sub("", block_text).strip()

            if block_text:
                if m_type == "ornamental":
                    arabic_blocks.setdefault(m_num, []).append(block_text)
                else:
                    dari_blocks.setdefault(m_num, []).append(block_text)

            prev_end = m_end

        # Build verses from matched blocks
        all_nums = sorted(set(list(arabic_blocks.keys()) + list(dari_blocks.keys())))
        for num in all_nums:
            arabic = " ".join(arabic_blocks.get(num, []))
            dari = " ".join(dari_blocks.get(num, []))
            verses.append({
                "verse_number": num,
                "arabic": arabic,
                "dari": dari,
            })
    else:
        # ── Strategy B: paren-only pairing ────────────────────────────
        # Two (N) markers per verse. First occurrence = Arabic, second = Dari.
        from collections import defaultdict
        verse_markers: dict[int, list[tuple]] = defaultdict(list)
        for m in markers:
            verse_markers[m[2]].append(m)

        for num in sorted(verse_markers.keys()):
            mlist = verse_markers[num]
            if len(mlist) >= 2:
                m1 = mlist[0]  # Arabic end
                m2 = mlist[1]  # Dari end

                # Find the start: end of the previous verse's last marker
                # For verse 1, start from 0
                prev_marker_end = 0
                for prev_num in sorted(verse_markers.keys()):
                    if prev_num >= num:
                        break
                    prev_markers = verse_markers[prev_num]
                    if prev_markers:
                        prev_marker_end = max(m[1] for m in prev_markers)

                arabic_raw = full_text[prev_marker_end:m1[0]].strip()
                dari_raw = full_text[m1[1]:m2[0]].strip()

                arabic_clean = PAREN_RE.sub("", arabic_raw).strip()
                arabic_clean = re.sub(r"\s*\n\s*", " ", arabic_clean).strip()
                dari_clean = PAREN_RE.sub("", dari_raw).strip()
                dari_clean = re.sub(r"\s*\n\s*", " ", dari_clean).strip()

                verses.append({
                    "verse_number": num,
                    "arabic": arabic_clean,
                    "dari": dari_clean,
                })

    return verses


# ─────────────────────────────────────────────────────────────────────────────
# Surah number extraction from filename
# ─────────────────────────────────────────────────────────────────────────────
SURAH_NUM_END_RE = re.compile(r"(\d+)\.docx$", re.IGNORECASE)
SURAH_NUM_START_RE = re.compile(r"^(\d+)\s", re.IGNORECASE)

def extract_surah_number(filename: str) -> Optional[int]:
    # Try number at end of filename first (most common)
    m = SURAH_NUM_END_RE.search(filename)
    if m:
        return int(m.group(1))
    # Try number at start of filename (e.g., "1 ترجمه سوره الفاتحه.docx")
    m = SURAH_NUM_START_RE.search(filename)
    if m:
        return int(m.group(1))
    return None


# ─────────────────────────────────────────────────────────────────────────────
# DB writer
# ─────────────────────────────────────────────────────────────────────────────
def write_dari_verses(conn: sqlite3.Connection, surah_number: int, verses: list[dict]):
    row = conn.execute("SELECT id FROM surahs WHERE number=?", (surah_number,)).fetchone()
    if row is None:
        print(f"    ERROR: Surah {surah_number} not found in surahs table!")
        return 0

    surah_id = row[0]
    written = 0

    for v in verses:
        conn.execute(
            """INSERT INTO verses (surah_id, verse_number, arabic, pashto, dari)
               VALUES (?, ?, ?, '', ?)
               ON CONFLICT(surah_id, verse_number) DO UPDATE SET
                 arabic = CASE WHEN excluded.arabic != '' THEN excluded.arabic ELSE verses.arabic END,
                 dari = excluded.dari""",
            (surah_id, v["verse_number"], v["arabic"], v["dari"]),
        )
        written += 1

    conn.commit()
    return written


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Batch import Dari translations from docx files")
    parser.add_argument("--dir", required=True, help="Directory containing Dari .docx files")
    parser.add_argument("--db", default="assets/db/quran.db", help="SQLite database path")
    parser.add_argument("--surah", type=int, help="Process only this surah number (for testing)")
    args = parser.parse_args()

    docx_dir = Path(args.dir)
    if not docx_dir.is_dir():
        print(f"ERROR: Directory not found: {docx_dir}", file=sys.stderr)
        sys.exit(1)

    db_path = Path(args.db)
    if not db_path.exists():
        print(f"ERROR: Database not found: {db_path}", file=sys.stderr)
        sys.exit(1)

    conn = sqlite3.connect(str(db_path))

    # Find all docx files (skip ~$ temp files)
    docx_files = sorted(
        [f for f in docx_dir.glob("*.docx") if not f.name.startswith("~$")],
        key=lambda f: extract_surah_number(f.name) or 999,
    )

    print(f"\nFound {len(docx_files)} docx files in {docx_dir}")

    success = 0
    errors = []
    skipped = 0

    for docx_file in docx_files:
        surah_num = extract_surah_number(docx_file.name)
        if surah_num is None:
            print(f"  SKIP: Can't extract surah number from: {docx_file.name}")
            skipped += 1
            continue

        if args.surah and surah_num != args.surah:
            continue

        print(f"\n  Surah {surah_num}: {docx_file.name}")

        try:
            paragraphs = extract_paragraphs(str(docx_file))
            print(f"    Paragraphs: {len(paragraphs)}")

            verses = parse_dari_verses(paragraphs)
            print(f"    Verses parsed: {len(verses)}")

            if verses:
                # Show first verse for verification
                v1 = verses[1] if len(verses) > 1 else verses[0]
                print(f"    [{v1['verse_number']}] Arabic: {v1['arabic'][:50]}...")
                print(f"    [{v1['verse_number']}] Dari:   {v1['dari'][:50]}...")

                # Check expected verse count
                meta = conn.execute(
                    "SELECT total_verses FROM surahs WHERE number=?", (surah_num,)
                ).fetchone()
                expected = meta[0] if meta else 0
                actual = len([v for v in verses if v["verse_number"] > 0])
                if expected and actual != expected:
                    print(f"    WARNING: Expected {expected} verses, got {actual}")

                written = write_dari_verses(conn, surah_num, verses)
                print(f"    Written: {written} rows")
                success += 1
            else:
                print(f"    WARNING: No verses extracted!")
                errors.append((surah_num, "No verses extracted"))

        except Exception as e:
            print(f"    ERROR: {e}")
            errors.append((surah_num, str(e)))

    conn.close()

    print(f"\n{'='*60}")
    print(f"Results: {success} surahs imported, {skipped} skipped, {len(errors)} errors")
    if errors:
        print(f"\nErrors:")
        for num, err in errors:
            print(f"  Surah {num}: {err}")
    print()


if __name__ == "__main__":
    main()
