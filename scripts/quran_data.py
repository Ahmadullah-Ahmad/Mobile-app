from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "assets" / "db" / "app.db"
DATA_DIR = Path(__file__).resolve().parent / "data"
ARABIC_PATH = DATA_DIR / "quran-arabic.txt"
TRANSLATION_FIXES_PATH = DATA_DIR / "translation-fixes.json"

TOTAL_SURAHS = 114
TOTAL_VERSES = 6236
TRANSLATION_FIELDS = ("pashto", "dari")

JUZ_STARTS = [
    (1, 1), (2, 142), (2, 253), (3, 93), (4, 24), (4, 148), (5, 82), (6, 111),
    (7, 88), (8, 41), (9, 93), (11, 6), (12, 53), (15, 1), (17, 1), (18, 75),
    (21, 1), (23, 1), (25, 21), (27, 56), (29, 46), (33, 31), (36, 28), (39, 32),
    (41, 47), (46, 1), (51, 31), (58, 1), (67, 1), (78, 1),
]


def load_arabic() -> dict[tuple[int, int], str]:
    verses: dict[tuple[int, int], str] = {}
    for line in ARABIC_PATH.read_text(encoding="utf-8").splitlines():
        if not line or line.startswith("#"):
            continue
        surah, verse, text = line.split("|", 2)
        verses[(int(surah), int(verse))] = text
    if len(verses) != TOTAL_VERSES:
        raise ValueError(f"{ARABIC_PATH.name} has {len(verses)} verses, expected {TOTAL_VERSES}")
    return verses


def load_translation_fixes() -> list[dict]:
    fixes = json.loads(TRANSLATION_FIXES_PATH.read_text(encoding="utf-8"))
    for fix in fixes:
        if fix["field"] not in TRANSLATION_FIELDS:
            raise ValueError(f"Unsupported field in translation fix: {fix}")
    return fixes


def verse_counts(arabic: dict[tuple[int, int], str]) -> dict[int, int]:
    counts: dict[int, int] = {}
    for surah, verse in arabic:
        counts[surah] = max(counts.get(surah, 0), verse)
    return counts


def juz_for(surah: int, verse: int) -> int:
    juz = 0
    for index, start in enumerate(JUZ_STARTS, start=1):
        if (surah, verse) >= start:
            juz = index
    return juz
