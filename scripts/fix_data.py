#!/usr/bin/env python3
"""
Repair the bundled database after the .docx imports.

Run it as the last step of the import pipeline, then run verify_db.py:

    python3 scripts/fix_data.py
    python3 scripts/verify_db.py

What it does:
  - replaces every Arabic verse with the verified Tanzil text in scripts/data/quran-arabic.txt
  - applies the reviewed translation corrections in scripts/data/translation-fixes.json
  - deletes the unused verse 0 (bismillah) rows
  - recomputes juz_number and surahs.total_verses

The script is idempotent and backs up the database to .db-backups/ before writing.
Use --dry-run to see the changes without writing.
"""

from __future__ import annotations

import argparse
import shutil
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

from quran_data import (
    DB_PATH,
    ROOT,
    juz_for,
    load_arabic,
    load_translation_fixes,
    verse_counts,
)


def backup(db_path: Path) -> Path:
    backup_dir = ROOT / ".db-backups"
    backup_dir.mkdir(exist_ok=True)
    target = backup_dir / f"{db_path.name}.bak-{datetime.now():%Y%m%d-%H%M%S}"
    shutil.copy2(db_path, target)
    return target


def repair(conn: sqlite3.Connection) -> dict[str, int]:
    arabic = load_arabic()
    stats = {}

    stats["verse 0 rows deleted"] = conn.execute(
        "DELETE FROM verses WHERE verse_number = 0"
    ).rowcount

    existing = {
        (s, v): text
        for s, v, text in conn.execute("SELECT surah_id, verse_number, arabic FROM verses")
    }
    missing = sorted(set(arabic) - set(existing))
    extra = sorted(set(existing) - set(arabic))
    if missing or extra:
        raise SystemExit(f"Verse rows do not match the Quran: missing={missing[:10]} extra={extra[:10]}")

    changed = [(text, s, v) for (s, v), text in arabic.items() if existing[(s, v)] != text]
    conn.executemany(
        "UPDATE verses SET arabic = ? WHERE surah_id = ? AND verse_number = ?", changed
    )
    stats["arabic verses replaced"] = len(changed)

    fixed = 0
    for fix in load_translation_fixes():
        fixed += conn.execute(
            f"UPDATE verses SET {fix['field']} = ? "
            f"WHERE surah_id = ? AND verse_number = ? AND {fix['field']} != ?",
            (fix["value"], fix["surah"], fix["verse"], fix["value"]),
        ).rowcount
    stats["translations corrected"] = fixed

    juz_rows = [
        (juz_for(s, v), s, v, juz_for(s, v))
        for s, v in arabic
    ]
    stats["juz numbers updated"] = sum(
        conn.execute(
            "UPDATE verses SET juz_number = ? WHERE surah_id = ? AND verse_number = ? "
            "AND juz_number IS NOT ?",
            row,
        ).rowcount
        for row in juz_rows
    )

    stats["surah verse counts updated"] = sum(
        conn.execute(
            "UPDATE surahs SET total_verses = ? WHERE number = ? AND total_verses != ?",
            (count, surah, count),
        ).rowcount
        for surah, count in verse_counts(arabic).items()
    )
    return stats


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--db", type=Path, default=DB_PATH)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not args.db.exists():
        print(f"Database not found: {args.db}", file=sys.stderr)
        return 1

    if not args.dry_run:
        print(f"Backup: {backup(args.db)}")

    conn = sqlite3.connect(args.db)
    try:
        stats = repair(conn)
        if args.dry_run:
            conn.rollback()
        else:
            conn.commit()
            conn.execute("VACUUM")
    finally:
        conn.close()

    label = "Would change" if args.dry_run else "Changed"
    for name, count in stats.items():
        print(f"{label}: {count} {name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
