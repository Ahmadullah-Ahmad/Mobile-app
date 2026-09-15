#!/usr/bin/env python3
"""
Pashto Translation Importer
===========================
Parses the Pashto .docx files (Arabic verse + Pashto translation) and fills the
`pashto` column of the existing `verses` rows.

The Dari import has already created every row, so this script only ever runs

    UPDATE verses SET pashto = ? WHERE surah_id = ? AND verse_number = ?

It never inserts rows and never writes `arabic` or `dari`. A verse that has no
matching row is reported rather than created.

Usage:
    # import every surah (the normal case)
    python3 scripts/import_pashto.py --dir "quran/په پښتو ژبه د قرآن عظیم الشأن ترجمه"

    # check what would happen without touching the DB
    python3 scripts/import_pashto.py --dir "..." --dry-run

    # one surah only, useful while debugging a single file
    python3 scripts/import_pashto.py --dir "..." --surah 18

Document format
---------------
Every file is a single stream alternating Arabic and Pashto, each segment
terminated by its verse number:

    <arabic> ﴿1﴾ <pashto> (1) <arabic> ﴿2﴾ <pashto> (2) ...

Paragraph boundaries are unreliable — some files put a whole verse pair in one
paragraph, others split mid-verse — so the text is joined and segmented by the
number markers instead. The marker *glyph* is not a reliable language signal
either (some files use ﴿N﴾ for Arabic and (N) for Pashto, others use (N) for
both), so segments are assigned by alternation: for verse N the first marker
closes the Arabic, the second closes the Pashto.
"""

from __future__ import annotations

import argparse
import re
import sqlite3
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path
from typing import Optional

# ─────────────────────────────────────────────────────────────────────────────
# Numerals
# ─────────────────────────────────────────────────────────────────────────────
ARABIC_INDIC = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")
EXTENDED_ARABIC_INDIC = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")


def to_int(s: str) -> int:
    return int(s.translate(ARABIC_INDIC).translate(EXTENDED_ARABIC_INDIC))


# ─────────────────────────────────────────────────────────────────────────────
# Patterns
# ─────────────────────────────────────────────────────────────────────────────
# Zero-width and bidi control characters that litter these files.
INVISIBLE = "​-\u200F\u202A-\u202E\u2066-\u2069﻿"
_INV = f"[{INVISIBLE}]*"

# A verse-number marker. Openers/closers are deliberately interchangeable:
# the files contain mirrored pairs such as ")۲)" produced by RTL editing.
MARKER_RE = re.compile(
    rf"(?:﴿|[\(\)（）])\s*{_INV}\s*([۰-۹٠-٩0-9]+)\s*{_INV}\s*(?:﴾|[\(\)（）])"
)

# Same, but tolerating a missing closing bracket — some files contain "(۷ ".
# Only used while scanning for the next expected number, never for cleaning,
# so a stray "(12" in prose cannot be mistaken for a marker.
LOOSE_MARKER_RE = re.compile(
    rf"(?:﴿|[\(\)（）])\s*{_INV}\s*([۰-۹٠-٩0-9]+)\s*{_INV}\s*(?:﴾|[\(\)（）])?"
)

# Lines describing the surah rather than quoting it ("...has (286) verses").
# Their parenthesised counts would otherwise read as verse markers.
INFO_RE = re.compile(r"نازل شو|مبارک آیت|آیتونه|آيتونه|رکوع|کلمې|توري|مکه کې|مدینه کې")
FOOTER_RE = re.compile(r"صدق الله|من الله التوفيق")
BISMILLAH_AR_RE = re.compile(r"بِسْمِ\s*اللَّهِ|بسم الله")
BISMILLAH_PS_RE = re.compile(r"په نوم چې رحمت")

TASHKEEL_RE = re.compile(r"[ؐ-ًؚ-ٰٟ]")
ARABIC_LETTER_RE = re.compile(r"[ؠ-ۿ]")
# Letters that exist in Pashto but never in Quranic Arabic.
PASHTO_LETTER_RE = re.compile(r"[ټډړږښګڼڅځۍ]")


def tashkeel_ratio(text: str) -> float:
    """Diacritics per Arabic letter. Vocalised Quranic text ~0.45, Pashto ~0.0."""
    letters = len(ARABIC_LETTER_RE.findall(text))
    return len(TASHKEEL_RE.findall(text)) / letters if letters else 0.0


def clean(text: str) -> str:
    """Drop markers, guillemets, invisibles and squeeze whitespace."""
    text = MARKER_RE.sub(" ", text)
    text = re.sub(f"[{INVISIBLE}]", "", text)
    text = text.replace("«", " ").replace("»", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip(" .،؛:-–—").strip()


# ─────────────────────────────────────────────────────────────────────────────
# docx text extraction
# ─────────────────────────────────────────────────────────────────────────────
WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"


def extract_paragraphs(docx_path: Path) -> list[str]:
    paragraphs: list[str] = []
    with zipfile.ZipFile(docx_path) as z:
        with z.open("word/document.xml") as f:
            body = ET.parse(f).getroot().find(f"{{{WORD_NS}}}body")
            if body is None:
                raise ValueError(f"Malformed docx (no <w:body>): {docx_path.name}")
            for p in body.findall(f"{{{WORD_NS}}}p"):
                runs = p.findall(f".//{{{WORD_NS}}}t")
                text = "".join(r.text or "" for r in runs).strip()
                if text:
                    paragraphs.append(text)
    return paragraphs


def build_stream(paragraphs: list[str]) -> tuple[str, str]:
    """
    Strip title / info / bismillah / footer lines and join the rest into one
    text stream. Returns (stream, pashto_bismillah).
    """
    kept: list[str] = []
    bismillah_pashto = ""

    for para in paragraphs:
        if FOOTER_RE.search(para):
            break
        # The bismillah translation opens the file — but in Al-Fatiha the same
        # wording *is* verse 1, so only treat it as header while no verse text
        # has been seen yet.
        if BISMILLAH_PS_RE.search(para) and not kept and not MARKER_RE.search(para):
            bismillah_pashto = clean(para)
            continue
        # An info line carries no verse text — but only skip it while we are
        # still in the header, so a glued "info + verse 1" paragraph survives.
        if INFO_RE.search(para) and not kept:
            continue
        # Title / bismillah header: no markers yet and no verse content.
        if not kept and not MARKER_RE.search(para):
            continue
        if not kept:
            # First content paragraph may have the bismillah glued to its front.
            para = BISMILLAH_AR_RE.sub(" ", para)
        kept.append(para)

    return re.sub(r"\s+", " ", " ".join(kept)).strip(), bismillah_pashto


# ─────────────────────────────────────────────────────────────────────────────
# Segmentation
# ─────────────────────────────────────────────────────────────────────────────
def split_arabic_tail(segment: str) -> tuple[str, str]:
    """
    Fallback for a verse whose Pashto carries no number marker, leaving
    "<pashto of N><arabic of N+1>" in one segment.

    Walks words from the end and keeps the vocalised Arabic run as the tail.
    Returns (pashto_head, arabic_tail).
    """
    words = segment.split()
    cut = len(words)
    for i in range(len(words) - 1, -1, -1):
        w = words[i]
        if PASHTO_LETTER_RE.search(w):
            break
        if TASHKEEL_RE.search(w) or not ARABIC_LETTER_RE.search(w):
            cut = i
            continue
        break
    if cut == len(words):
        return segment, ""
    return " ".join(words[:cut]), " ".join(words[cut:])


def parse_verses(stream: str, total_verses: int) -> tuple[list[dict], list[str]]:
    """
    Segment the joined stream into verses by alternating on number markers.

    For verse N the first marker valued N closes the Arabic and the second
    closes the Pashto. Markers that do not advance the expected sequence are
    stray numbers inside the prose and are ignored.
    """
    verses: list[dict] = []
    warnings: list[str] = []

    expect = 1
    want_arabic = True
    pos = 0

    for m in LOOSE_MARKER_RE.finditer(stream):
        value = to_int(m.group(1))
        if value > total_verses:
            continue
        # An unclosed marker is only trusted when it is exactly the number the
        # sequence is waiting for.
        if not m.group(0).rstrip().endswith(("﴾", ")", "(", "）", "（")) and value != expect:
            continue

        if want_arabic:
            # Segment before this marker is the Arabic of `expect`; we do not
            # keep it — only its end position matters for slicing the Pashto.
            if value != expect:
                continue
            pos = m.end()
            want_arabic = False
            continue

        # Looking for the Pashto that closes `expect`.
        if value == expect:
            verses.append(
                {"verse_number": expect, "pashto": clean(stream[pos : m.start()])}
            )
            pos = m.end()
            expect += 1
            want_arabic = True
        elif value == expect + 1:
            # Two possibilities, told apart by what the segment actually holds:
            #
            #  a) the source mis-numbered this closing marker (several files
            #     close verse N's translation with "(N+1)") — the segment is
            #     Pashto and belongs to `expect`;
            #  b) the translation for `expect` is genuinely absent, so this
            #     marker closes the *next* verse's Arabic.
            # A vocalised Arabic tail means the next verse's Arabic is sitting
            # in this segment, i.e. case (b). No tail means case (a).
            segment = stream[pos : m.start()]
            head, tail = split_arabic_tail(segment)
            pos = m.end()
            if not tail.strip():
                verses.append({"verse_number": expect, "pashto": clean(segment)})
                warnings.append(f"verse {expect}: closing marker numbered {value}")
                expect += 1
                want_arabic = True
            else:
                verses.append({"verse_number": expect, "pashto": clean(head)})
                warnings.append(f"verse {expect}: no closing marker, split heuristically")
                expect += 1
                want_arabic = False

    # Trailing verse whose closing Pashto marker is absent (last verse of file).
    if not want_arabic and expect <= total_verses:
        tail = clean(stream[pos:])
        if tail:
            verses.append({"verse_number": expect, "pashto": tail})

    # Collapse duplicates, preferring a non-empty translation.
    merged: dict[int, dict] = {}
    for v in verses:
        prev = merged.get(v["verse_number"])
        if prev and prev["pashto"] and not v["pashto"]:
            continue
        merged[v["verse_number"]] = v
    return [merged[k] for k in sorted(merged)], warnings


# ─────────────────────────────────────────────────────────────────────────────
# Validation
# ─────────────────────────────────────────────────────────────────────────────
def validate(verses: list[dict], total: int) -> list[str]:
    problems: list[str] = []
    numbers = {v["verse_number"] for v in verses if v["pashto"]}

    missing = sorted(set(range(1, total + 1)) - numbers)
    if missing:
        problems.append(
            f"no Pashto for {len(missing)} verse(s): {missing[:10]}"
            f"{' …' if len(missing) > 10 else ''}"
        )

    extra = sorted(n for n in numbers if n < 1 or n > total)
    if extra:
        problems.append(f"unexpected verse numbers: {extra[:10]}")

    # Arabic text leaking into the Pashto column shows up as heavy vocalisation.
    leaked = sorted(
        v["verse_number"]
        for v in verses
        if v["pashto"] and tashkeel_ratio(v["pashto"]) > 0.25
    )
    if leaked:
        problems.append(f"Pashto looks like Arabic: {leaked[:10]}")

    return problems


# ─────────────────────────────────────────────────────────────────────────────
# Filenames → surah number
# ─────────────────────────────────────────────────────────────────────────────
# Four files are named in a way no rule can resolve: two carry a number that
# belongs to a different surah, two carry none usable. Map them explicitly.
FILENAME_OVERRIDES = {
    "د المسد سورت پښتو ژباړه 11.docx": 111,   # Al-Masad, not Hud
    "د ابراهيم سورت پښتو ژباړه 114.docx": 14,  # Ibrahim, not An-Nas
    "د المعارج سورت پښتو ژباړه 70 .docx": 70,  # trailing space before .docx
    "د الاحقاف سورت پښتو ژباړه.docx": 46,      # no number in the name
}

TRAILING_NUM_RE = re.compile(r"(\d+)\s*\.docx$", re.IGNORECASE)


def surah_number_from_filename(name: str) -> Optional[int]:
    if name in FILENAME_OVERRIDES:
        return FILENAME_OVERRIDES[name]
    m = TRAILING_NUM_RE.search(name)
    if m:
        n = int(m.group(1))
        if 1 <= n <= 114:
            return n
    return None


# ─────────────────────────────────────────────────────────────────────────────
# Database — UPDATE only
# ─────────────────────────────────────────────────────────────────────────────
def write_pashto(
    conn: sqlite3.Connection,
    surah_id: int,
    verses: list[dict],
    bismillah_pashto: str,
) -> tuple[int, list[int]]:
    """
    Set `pashto` on rows that already exist. Returns (updated, unmatched)
    where `unmatched` lists verse numbers with no row in the table.
    """
    rows = [v for v in verses if v["pashto"]]
    if bismillah_pashto:
        rows.insert(0, {"verse_number": 0, "pashto": bismillah_pashto})

    updated = 0
    unmatched: list[int] = []
    for v in rows:
        cur = conn.execute(
            "UPDATE verses SET pashto = ? WHERE surah_id = ? AND verse_number = ?",
            (v["pashto"], surah_id, v["verse_number"]),
        )
        if cur.rowcount:
            updated += 1
        else:
            unmatched.append(v["verse_number"])
    return updated, unmatched


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────
def main() -> int:
    ap = argparse.ArgumentParser(description="Import Pashto translations from .docx")
    ap.add_argument("--dir", required=True, help="Directory of Pashto .docx files")
    ap.add_argument("--db", default="assets/db/app.db", help="SQLite database path")
    ap.add_argument("--surah", type=int, help="Import only this surah number")
    ap.add_argument("--dry-run", action="store_true", help="Parse and report, write nothing")
    args = ap.parse_args()

    docx_dir = Path(args.dir)
    if not docx_dir.is_dir():
        print(f"ERROR: not a directory: {docx_dir}", file=sys.stderr)
        return 1

    db_path = Path(args.db)
    if not db_path.exists():
        print(f"ERROR: database not found: {db_path}", file=sys.stderr)
        return 1

    conn = sqlite3.connect(str(db_path))
    meta = {
        r[0]: (r[1], r[2])
        for r in conn.execute("SELECT number, id, total_verses FROM surahs")
    }
    if not meta:
        print("ERROR: surahs table is empty — run the init step first", file=sys.stderr)
        return 1

    files = [f for f in sorted(docx_dir.glob("*.docx")) if not f.name.startswith("~$")]
    if not files:
        print(f"ERROR: no .docx files in {docx_dir}", file=sys.stderr)
        return 1

    print(f"\n{len(files)} file(s) in {docx_dir}")
    print("DRY RUN — no changes will be written\n" if args.dry_run else "")

    unresolved: list[str] = []
    flagged: list[int] = []
    total_updated = 0
    all_unmatched: list[tuple[int, list[int]]] = []
    ok = 0

    for f in files:
        surah = surah_number_from_filename(f.name)
        if surah is None:
            unresolved.append(f.name)
            continue
        if args.surah and surah != args.surah:
            continue
        if surah not in meta:
            print(f"  [{surah:3d}] skipped — not in surahs table ({f.name})")
            continue

        surah_id, total = meta[surah]
        try:
            stream, bismillah = build_stream(extract_paragraphs(f))
            verses, warnings = parse_verses(stream, total)
        except Exception as e:  # noqa: BLE001 — one bad file must not stop the run
            print(f"  [{surah:3d}] FAILED  {f.name}: {e}")
            flagged.append(surah)
            continue

        problems = validate(verses, total)
        got = len([v for v in verses if v["pashto"]])

        if problems:
            flagged.append(surah)
            print(f"  [{surah:3d}] {got:4d}/{total:<4d} !  {problems[0]}")
            for p in problems[1:]:
                print(f"              {p}")
        else:
            ok += 1
            print(f"  [{surah:3d}] {got:4d}/{total:<4d} ok{'  (' + warnings[0] + ')' if warnings else ''}")

        if not args.dry_run:
            updated, unmatched = write_pashto(conn, surah_id, verses, bismillah)
            total_updated += updated
            if unmatched:
                all_unmatched.append((surah, unmatched))

    if not args.dry_run:
        conn.commit()

    print(f"\n{'-' * 60}")
    print(f"clean surahs : {ok}")
    print(f"flagged      : {len(flagged)}" + (f"  {sorted(flagged)}" if flagged else ""))
    if unresolved:
        print(f"unresolved filenames ({len(unresolved)}):")
        for n in unresolved:
            print(f"    {n}")
    if all_unmatched:
        print("verses with no existing row (not written):")
        for surah, nums in all_unmatched:
            print(f"    surah {surah}: {nums[:10]}")

    if args.dry_run:
        print("\nDRY RUN — nothing written")
    else:
        print(f"rows updated : {total_updated}")
        remaining = conn.execute(
            "SELECT COUNT(*) FROM verses WHERE trim(pashto) = ''"
        ).fetchone()[0]
        print(f"verses still without Pashto: {remaining}")

    conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
