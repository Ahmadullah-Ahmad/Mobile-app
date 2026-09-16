#!/usr/bin/env python3
"""
Check the bundled database before shipping it. Exits with status 1 on any problem.

    python3 scripts/verify_db.py
    python3 scripts/verify_db.py --db path/to/app.db
"""

from __future__ import annotations

import argparse
import re
import sqlite3
import sys
from pathlib import Path

from quran_data import (
    DB_PATH,
    JUZ_STARTS,
    TOTAL_SURAHS,
    TOTAL_VERSES,
    TRANSLATION_FIELDS,
    juz_for,
    load_arabic,
    verse_counts,
)

MAX_REPORTED = 15
DIACRITIC = re.compile(r"[ً-ْ]")
VERSE_MARKER = re.compile(r"[﴿﴾]|\(\s*[۰-۹٠-٩0-9]+(\s*-\s*[۰-۹٠-٩0-9]+)?\s*\)\s*$")
SHARED_TRANSLATIONS = {("dari", 69, 38)}


def voweled_run_at_edge(text: str, min_words: int = 3) -> bool:
    words = text.split()
    head = words[:min_words]
    tail = words[-min_words:]
    voweled = lambda chunk: len(chunk) == min_words and all(DIACRITIC.search(w) for w in chunk)
    return voweled(head) or voweled(tail)


def check_surahs(conn, arabic):
    problems = []
    counts = verse_counts(arabic)
    rows = conn.execute("SELECT id, number, total_verses FROM surahs ORDER BY number").fetchall()
    if len(rows) != TOTAL_SURAHS:
        problems.append(f"expected {TOTAL_SURAHS} surahs, found {len(rows)}")
    for surah_id, number, total in rows:
        if surah_id != number:
            problems.append(f"surah {number} has id {surah_id}")
        if total != counts.get(number):
            problems.append(f"surah {number} total_verses is {total}, expected {counts.get(number)}")
    return problems


def check_verse_rows(conn, arabic):
    keys = {(s, v) for s, v in conn.execute("SELECT surah_id, verse_number FROM verses")}
    problems = [f"missing verse {s}:{v}" for s, v in sorted(set(arabic) - keys)]
    problems += [f"unexpected verse row {s}:{v}" for s, v in sorted(keys - set(arabic))]
    if len(keys) != TOTAL_VERSES:
        problems.append(f"expected {TOTAL_VERSES} verses, found {len(keys)}")
    return problems


def check_arabic(conn, arabic):
    return [
        f"{s}:{v} Arabic differs from scripts/data/quran-arabic.txt"
        for s, v, text in conn.execute("SELECT surah_id, verse_number, arabic FROM verses")
        if arabic.get((s, v)) not in (None, text)
    ]


def check_translations(conn, _arabic):
    problems = []
    rows = conn.execute(
        "SELECT surah_id, verse_number, pashto, dari FROM verses ORDER BY surah_id, verse_number"
    ).fetchall()
    previous = None
    for s, v, pashto, dari in rows:
        for field, text in zip(TRANSLATION_FIELDS, (pashto, dari)):
            if not text.strip():
                problems.append(f"{s}:{v} {field} is empty")
                continue
            if text != text.strip():
                problems.append(f"{s}:{v} {field} has leading or trailing whitespace")
            if VERSE_MARKER.search(text):
                problems.append(f"{s}:{v} {field} contains a verse number marker")
            if voweled_run_at_edge(text):
                problems.append(f"{s}:{v} {field} starts or ends with Arabic verse text")
            if previous and previous[0] == s:
                prev_text = previous[2] if field == "pashto" else previous[3]
                if text == prev_text and (field, s, previous[1]) not in SHARED_TRANSLATIONS:
                    problems.append(f"{s}:{v} {field} duplicates verse {previous[1]}")
        previous = (s, v, pashto, dari)
    return problems


def check_juz(conn, arabic):
    problems = []
    rows = conn.execute(
        "SELECT number, start_surah, start_verse, end_surah, end_verse FROM juz ORDER BY number"
    ).fetchall()
    if [(r[1], r[2]) for r in rows] != JUZ_STARTS:
        problems.append("juz table start positions differ from the standard juz boundaries")
    ordered = sorted(arabic)
    for index, (number, *_rest, end_surah, end_verse) in enumerate(rows):
        next_start = JUZ_STARTS[index + 1] if index + 1 < len(JUZ_STARTS) else None
        expected_end = ordered[ordered.index(next_start) - 1] if next_start else ordered[-1]
        if (end_surah, end_verse) != expected_end:
            problems.append(f"juz {number} ends at {end_surah}:{end_verse}, expected {expected_end[0]}:{expected_end[1]}")
    for s, v, juz in conn.execute("SELECT surah_id, verse_number, juz_number FROM verses"):
        if juz != juz_for(s, v):
            problems.append(f"{s}:{v} juz_number is {juz}, expected {juz_for(s, v)}")
    return problems


def check_user_tables(conn, _arabic):
    problems = []
    for table in ("bookmarks", "last_read"):
        count = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        if count:
            problems.append(f"{table} has {count} rows; the bundled database must ship without user data")
    return problems


CHECKS = [
    ("Surahs", check_surahs),
    ("Verse rows", check_verse_rows),
    ("Arabic text", check_arabic),
    ("Translations", check_translations),
    ("Juz", check_juz),
    ("User data", check_user_tables),
]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--db", type=Path, default=DB_PATH)
    args = parser.parse_args()

    if not args.db.exists():
        print(f"Database not found: {args.db}", file=sys.stderr)
        return 1

    arabic = load_arabic()
    conn = sqlite3.connect(f"file:{args.db}?mode=ro", uri=True)
    failed = 0
    try:
        for name, check in CHECKS:
            problems = check(conn, arabic)
            status = "ok" if not problems else f"{len(problems)} problem(s)"
            print(f"{name}: {status}")
            for problem in problems[:MAX_REPORTED]:
                print(f"  - {problem}")
            if len(problems) > MAX_REPORTED:
                print(f"  ... and {len(problems) - MAX_REPORTED} more")
            failed += bool(problems)
    finally:
        conn.close()

    print("PASS" if not failed else "FAIL")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
