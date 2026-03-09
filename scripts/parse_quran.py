#!/usr/bin/env python3
"""
Quran Docx → SQLite Parser
Parses a .docx file containing Arabic verses + Pashto translations
and writes a structured SQLite database.

Usage:
    python3 scripts/parse_quran.py \
        --docx "د الکهف سورت پښتو ژباړه.docx" \
        --surah-number 18 \
        --output assets/db/quran.db

To add more surahs later, run with --append flag:
    python3 scripts/parse_quran.py \
        --docx "other_surah.docx" \
        --surah-number 2 \
        --output assets/db/quran.db \
        --append
"""

import argparse
import re
import sqlite3
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

# ─────────────────────────────────────────────────────────────────────────────
# Surah metadata for all 114 surahs
# Format: (number, name_arabic, name_pashto, name_dari, transliteration, total_verses, revelation)
# ─────────────────────────────────────────────────────────────────────────────
SURAHS_METADATA = [
    (1,  "الفاتحة",      "د الفاتحې سورت",     "سوره فاتحه",       "Al-Fatiha",        7,   "meccan"),
    (2,  "البقرة",       "د البقرې سورت",      "سوره بقره",        "Al-Baqara",        286, "medinan"),
    (3,  "آل عمران",     "د آل عمران سورت",    "سوره آل عمران",    "Aal-e-Imran",      200, "medinan"),
    (4,  "النساء",       "د النساء سورت",      "سوره نساء",        "An-Nisa",          176, "medinan"),
    (5,  "المائدة",      "د المائدې سورت",     "سوره مائده",       "Al-Ma'ida",        120, "medinan"),
    (6,  "الأنعام",      "د الأنعام سورت",     "سوره انعام",       "Al-An'am",         165, "meccan"),
    (7,  "الأعراف",      "د الأعراف سورت",     "سوره اعراف",       "Al-A'raf",         206, "meccan"),
    (8,  "الأنفال",      "د الأنفال سورت",     "سوره انفال",       "Al-Anfal",         75,  "medinan"),
    (9,  "التوبة",       "د التوبې سورت",      "سوره توبه",        "At-Tawba",         129, "medinan"),
    (10, "يونس",         "د یونس سورت",        "سوره یونس",        "Yunus",            109, "meccan"),
    (11, "هود",          "د هود سورت",         "سوره هود",         "Hud",              123, "meccan"),
    (12, "يوسف",         "د یوسف سورت",        "سوره یوسف",        "Yusuf",            111, "meccan"),
    (13, "الرعد",        "د الرعد سورت",       "سوره رعد",         "Ar-Ra'd",          43,  "medinan"),
    (14, "إبراهيم",      "د ابراهیم سورت",     "سوره ابراهیم",     "Ibrahim",          52,  "meccan"),
    (15, "الحجر",        "د الحجر سورت",       "سوره حجر",         "Al-Hijr",          99,  "meccan"),
    (16, "النحل",        "د النحل سورت",       "سوره نحل",         "An-Nahl",          128, "meccan"),
    (17, "الإسراء",      "د الإسراء سورت",     "سوره اسراء",       "Al-Isra",          111, "meccan"),
    (18, "الكهف",        "د الکهف سورت",       "سوره کهف",         "Al-Kahf",          110, "meccan"),
    (19, "مريم",         "د مریم سورت",        "سوره مریم",        "Maryam",           98,  "meccan"),
    (20, "طه",           "د طه سورت",          "سوره طه",          "Ta-Ha",            135, "meccan"),
    (21, "الأنبياء",     "د الأنبیاء سورت",    "سوره انبیاء",      "Al-Anbiya",        112, "meccan"),
    (22, "الحج",         "د الحج سورت",        "سوره حج",          "Al-Hajj",          78,  "medinan"),
    (23, "المؤمنون",     "د المؤمنون سورت",    "سوره مؤمنون",      "Al-Mu'minun",      118, "meccan"),
    (24, "النور",        "د النور سورت",       "سوره نور",         "An-Nur",           64,  "medinan"),
    (25, "الفرقان",      "د الفرقان سورت",     "سوره فرقان",       "Al-Furqan",        77,  "meccan"),
    (26, "الشعراء",      "د الشعراء سورت",     "سوره شعراء",       "Ash-Shu'ara",      227, "meccan"),
    (27, "النمل",        "د النمل سورت",       "سوره نمل",         "An-Naml",          93,  "meccan"),
    (28, "القصص",        "د القصص سورت",       "سوره قصص",         "Al-Qasas",         88,  "meccan"),
    (29, "العنكبوت",     "د العنکبوت سورت",    "سوره عنکبوت",      "Al-Ankabut",       69,  "meccan"),
    (30, "الروم",        "د الروم سورت",       "سوره روم",         "Ar-Rum",           60,  "meccan"),
    (31, "لقمان",        "د لقمان سورت",       "سوره لقمان",       "Luqman",           34,  "meccan"),
    (32, "السجدة",       "د السجدې سورت",      "سوره سجده",        "As-Sajda",         30,  "meccan"),
    (33, "الأحزاب",      "د الأحزاب سورت",     "سوره احزاب",       "Al-Ahzab",         73,  "medinan"),
    (34, "سبأ",          "د سبا سورت",         "سوره سبا",         "Saba",             54,  "meccan"),
    (35, "فاطر",         "د فاطر سورت",        "سوره فاطر",        "Fatir",            45,  "meccan"),
    (36, "يس",           "د یاسین سورت",       "سوره یاسین",       "Ya-Sin",           83,  "meccan"),
    (37, "الصافات",      "د الصافات سورت",     "سوره صافات",       "As-Saffat",        182, "meccan"),
    (38, "ص",            "د صاد سورت",         "سوره صاد",         "Sad",              88,  "meccan"),
    (39, "الزمر",        "د الزمر سورت",       "سوره زمر",         "Az-Zumar",         75,  "meccan"),
    (40, "غافر",         "د غافر سورت",        "سوره غافر",        "Ghafir",           85,  "meccan"),
    (41, "فصلت",         "د فصلت سورت",        "سوره فصلت",        "Fussilat",         54,  "meccan"),
    (42, "الشورى",       "د الشورى سورت",      "سوره شوری",        "Ash-Shura",        53,  "meccan"),
    (43, "الزخرف",       "د الزخرف سورت",      "سوره زخرف",        "Az-Zukhruf",       89,  "meccan"),
    (44, "الدخان",       "د الدخان سورت",      "سوره دخان",        "Ad-Dukhan",        59,  "meccan"),
    (45, "الجاثية",      "د الجاثیې سورت",     "سوره جاثیه",       "Al-Jathiya",       37,  "meccan"),
    (46, "الأحقاف",      "د الأحقاف سورت",     "سوره احقاف",       "Al-Ahqaf",         35,  "meccan"),
    (47, "محمد",         "د محمد سورت",        "سوره محمد",        "Muhammad",         38,  "medinan"),
    (48, "الفتح",        "د الفتح سورت",       "سوره فتح",         "Al-Fath",          29,  "medinan"),
    (49, "الحجرات",      "د الحجرات سورت",     "سوره حجرات",       "Al-Hujurat",       18,  "medinan"),
    (50, "ق",            "د قاف سورت",         "سوره قاف",         "Qaf",              45,  "meccan"),
    (51, "الذاريات",     "د الذاریات سورت",    "سوره ذاریات",      "Adh-Dhariyat",     60,  "meccan"),
    (52, "الطور",        "د الطور سورت",       "سوره طور",         "At-Tur",           49,  "meccan"),
    (53, "النجم",        "د النجم سورت",       "سوره نجم",         "An-Najm",          62,  "meccan"),
    (54, "القمر",        "د القمر سورت",       "سوره قمر",         "Al-Qamar",         55,  "meccan"),
    (55, "الرحمن",       "د الرحمن سورت",      "سوره رحمن",        "Ar-Rahman",        78,  "medinan"),
    (56, "الواقعة",      "د الواقعې سورت",     "سوره واقعه",       "Al-Waqi'a",        96,  "meccan"),
    (57, "الحديد",       "د الحدید سورت",      "سوره حدید",        "Al-Hadid",         29,  "medinan"),
    (58, "المجادلة",     "د المجادلې سورت",    "سوره مجادله",      "Al-Mujadila",      22,  "medinan"),
    (59, "الحشر",        "د الحشر سورت",       "سوره حشر",         "Al-Hashr",         24,  "medinan"),
    (60, "الممتحنة",     "د الممتحنې سورت",    "سوره ممتحنه",      "Al-Mumtahana",     13,  "medinan"),
    (61, "الصف",         "د الصف سورت",        "سوره صف",          "As-Saf",           14,  "medinan"),
    (62, "الجمعة",       "د الجمعې سورت",      "سوره جمعه",        "Al-Jumu'a",        11,  "medinan"),
    (63, "المنافقون",    "د المنافقون سورت",   "سوره منافقون",     "Al-Munafiqun",     11,  "medinan"),
    (64, "التغابن",      "د التغابن سورت",     "سوره تغابن",       "At-Taghabun",      18,  "medinan"),
    (65, "الطلاق",       "د الطلاق سورت",      "سوره طلاق",        "At-Talaq",         12,  "medinan"),
    (66, "التحريم",      "د التحریم سورت",     "سوره تحریم",       "At-Tahrim",        12,  "medinan"),
    (67, "الملك",        "د الملک سورت",       "سوره ملک",         "Al-Mulk",          30,  "meccan"),
    (68, "القلم",        "د القلم سورت",       "سوره قلم",         "Al-Qalam",         52,  "meccan"),
    (69, "الحاقة",       "د الحاقې سورت",      "سوره حاقه",        "Al-Haqqah",        52,  "meccan"),
    (70, "المعارج",      "د المعارج سورت",     "سوره معارج",       "Al-Ma'arij",       44,  "meccan"),
    (71, "نوح",          "د نوح سورت",         "سوره نوح",         "Nuh",              28,  "meccan"),
    (72, "الجن",         "د الجن سورت",        "سوره جن",          "Al-Jinn",          28,  "meccan"),
    (73, "المزمل",       "د المزمل سورت",      "سوره مزمل",        "Al-Muzzammil",     20,  "meccan"),
    (74, "المدثر",       "د المدثر سورت",      "سوره مدثر",        "Al-Muddaththir",   56,  "meccan"),
    (75, "القيامة",      "د القیامې سورت",     "سوره قیامه",       "Al-Qiyama",        40,  "meccan"),
    (76, "الإنسان",      "د الانسان سورت",     "سوره انسان",       "Al-Insan",         31,  "medinan"),
    (77, "المرسلات",     "د المرسلات سورت",    "سوره مرسلات",      "Al-Mursalat",      50,  "meccan"),
    (78, "النبأ",        "د النبا سورت",       "سوره نبا",         "An-Naba",          40,  "meccan"),
    (79, "النازعات",     "د النازعات سورت",    "سوره نازعات",      "An-Nazi'at",       46,  "meccan"),
    (80, "عبس",          "د عبس سورت",         "سوره عبس",         "Abasa",            42,  "meccan"),
    (81, "التكوير",      "د التکویر سورت",     "سوره تکویر",       "At-Takwir",        29,  "meccan"),
    (82, "الانفطار",     "د الانفطار سورت",    "سوره انفطار",      "Al-Infitar",       19,  "meccan"),
    (83, "المطففين",     "د المطففین سورت",    "سوره مطففین",      "Al-Mutaffifin",    36,  "meccan"),
    (84, "الانشقاق",     "د الانشقاق سورت",    "سوره انشقاق",      "Al-Inshiqaq",      25,  "meccan"),
    (85, "البروج",       "د البروج سورت",      "سوره بروج",        "Al-Buruj",         22,  "meccan"),
    (86, "الطارق",       "د الطارق سورت",      "سوره طارق",        "At-Tariq",         17,  "meccan"),
    (87, "الأعلى",       "د الأعلى سورت",      "سوره اعلی",        "Al-A'la",          19,  "meccan"),
    (88, "الغاشية",      "د الغاشیې سورت",     "سوره غاشیه",       "Al-Ghashiya",      26,  "meccan"),
    (89, "الفجر",        "د الفجر سورت",       "سوره فجر",         "Al-Fajr",          30,  "meccan"),
    (90, "البلد",        "د البلد سورت",       "سوره بلد",         "Al-Balad",         20,  "meccan"),
    (91, "الشمس",        "د الشمس سورت",       "سوره شمس",         "Ash-Shams",        15,  "meccan"),
    (92, "الليل",        "د اللیل سورت",       "سوره لیل",         "Al-Layl",          21,  "meccan"),
    (93, "الضحى",        "د الضحى سورت",       "سوره ضحی",         "Ad-Duha",          11,  "meccan"),
    (94, "الشرح",        "د الشرح سورت",       "سوره شرح",         "Ash-Sharh",        8,   "meccan"),
    (95, "التين",        "د التین سورت",       "سوره تین",         "At-Tin",           8,   "meccan"),
    (96, "العلق",        "د العلق سورت",       "سوره علق",         "Al-Alaq",          19,  "meccan"),
    (97, "القدر",        "د القدر سورت",       "سوره قدر",         "Al-Qadr",          5,   "meccan"),
    (98, "البينة",       "د البینې سورت",      "سوره بینه",        "Al-Bayyina",       8,   "medinan"),
    (99, "الزلزلة",      "د الزلزلې سورت",     "سوره زلزله",       "Az-Zalzala",       8,   "medinan"),
    (100,"العاديات",     "د العادیات سورت",    "سوره عادیات",      "Al-Adiyat",        11,  "meccan"),
    (101,"القارعة",      "د القارعې سورت",     "سوره قارعه",       "Al-Qari'a",        11,  "meccan"),
    (102,"التكاثر",      "د التکاثر سورت",     "سوره تکاثر",       "At-Takathur",      8,   "meccan"),
    (103,"العصر",        "د العصر سورت",       "سوره عصر",         "Al-Asr",           3,   "meccan"),
    (104,"الهمزة",       "د الهمزې سورت",      "سوره همزه",        "Al-Humaza",        9,   "meccan"),
    (105,"الفيل",        "د الفیل سورت",       "سوره فیل",         "Al-Fil",           5,   "meccan"),
    (106,"قريش",         "د قریش سورت",        "سوره قریش",        "Quraysh",          4,   "meccan"),
    (107,"الماعون",      "د الماعون سورت",     "سوره ماعون",       "Al-Ma'un",         7,   "meccan"),
    (108,"الكوثر",       "د الکوثر سورت",      "سوره کوثر",        "Al-Kawthar",       3,   "meccan"),
    (109,"الكافرون",     "د الکافرون سورت",    "سوره کافرون",      "Al-Kafirun",       6,   "meccan"),
    (110,"النصر",        "د النصر سورت",       "سوره نصر",         "An-Nasr",          3,   "medinan"),
    (111,"المسد",        "د المسد سورت",       "سوره مسد",         "Al-Masad",         5,   "meccan"),
    (112,"الإخلاص",      "د الاخلاص سورت",     "سوره اخلاص",       "Al-Ikhlas",        4,   "meccan"),
    (113,"الفلق",        "د الفلق سورت",       "سوره فلق",         "Al-Falaq",         5,   "meccan"),
    (114,"الناس",        "د الناس سورت",       "سوره ناس",         "An-Nas",           6,   "meccan"),
]

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

# Arabic-Indic numerals → int
ARABIC_INDIC = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")
EXTENDED_ARABIC_INDIC = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")

def normalize_number(s: str) -> str:
    return s.translate(ARABIC_INDIC).translate(EXTENDED_ARABIC_INDIC)

# Regex to find verse number inside ﴿X﴾  (ornamental Quranic brackets)
VERSE_NUM_RE = re.compile(r"﴿([۰-۹٠-٩0-9]+)﴾")
# Regex to strip trailing translation number  e.g. (۱) or (1) at end of Pashto
TRANS_NUM_RE = re.compile(r"\s*[\(（]\s*([۰-۹٠-٩0-9]+)\s*[\)）]\s*$")
# Detect if a paragraph contains an Arabic verse (has ornamental brackets)
IS_ARABIC_VERSE = re.compile(r"﴿[۰-۹٠-٩0-9]+﴾")
# Inline translation number (N) — may contain invisible Unicode chars (ZWJ, ZWNJ, etc.)
INLINE_NUM_RE = re.compile(r"[\(（][\u200B-\u200F\u200C\u200D]?([۰-۹٠-٩0-9]+)[\u200B-\u200F\u200C\u200D]?[\)）]")


def split_mixed_paragraphs(paras: list[str]) -> list[str]:
    """
    Some docx files concatenate a Pashto translation (ending with (N)) and
    the next Arabic verse in the same paragraph, e.g.:
        …د هوساینې لار ومومي (‍۱۶)وَتَرَي الشَّمْسَ … ﴿۱۷﴾
    This function splits such paragraphs at the (N) boundary so each piece
    is processed independently.
    """
    result = []
    for para in paras:
        if not IS_ARABIC_VERSE.search(para):
            result.append(para)
            continue

        split_done = False
        for m in INLINE_NUM_RE.finditer(para):
            after = para[m.end():]
            if after.strip() and IS_ARABIC_VERSE.search(after):
                result.append(para[:m.end()].strip())   # Pashto + (N)
                result.append(after.strip())             # Arabic verse onward
                split_done = True
                break

        if not split_done:
            result.append(para)

    return result


def extract_paragraphs(docx_path: str) -> list[str]:
    """Extract plain text from every paragraph in a .docx file."""
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
                paras.append(text)
    return paras


def parse_verses(paragraphs: list[str]) -> list[dict]:
    """
    Walk paragraphs and extract (verse_number, arabic, pashto) triples.
    Pattern:
      - Arabic verse paragraph: contains ﴿N﴾
      - Immediately followed by Pashto translation paragraph
    Also extracts the Bismillah as verse_number=0.
    """
    paragraphs = split_mixed_paragraphs(paragraphs)
    verses: list[dict] = []
    bismillah_arabic = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ"
    bismillah_pashto = ""

    i = 0
    while i < len(paragraphs):
        para = paragraphs[i]

        # ── Bismillah (not numbered) ──────────────────────────────────────
        if "بسم" in para and "الله" in para and "الرحمن" in para and not IS_ARABIC_VERSE.search(para):
            bismillah_arabic = para
            # Next paragraph is the Pashto translation
            if i + 1 < len(paragraphs) and not IS_ARABIC_VERSE.search(paragraphs[i + 1]):
                bismillah_pashto = paragraphs[i + 1]
                i += 2
            else:
                i += 1
            verses.append({
                "verse_number": 0,
                "arabic": bismillah_arabic,
                "pashto": bismillah_pashto,
            })
            continue

        # ── Numbered verse ────────────────────────────────────────────────
        m = IS_ARABIC_VERSE.search(para)
        if m:
            num_match = VERSE_NUM_RE.search(para)
            if num_match:
                verse_num = int(normalize_number(num_match.group(1)))
            else:
                verse_num = len(verses)  # fallback

            # Strip the ﴿N﴾ marker from Arabic text
            arabic_clean = VERSE_NUM_RE.sub("", para).strip()

            # Next paragraph → Pashto translation
            pashto = ""
            if i + 1 < len(paragraphs) and not IS_ARABIC_VERSE.search(paragraphs[i + 1]):
                pashto_raw = paragraphs[i + 1]
                # Remove trailing verse number like (۱) or (1)
                pashto = TRANS_NUM_RE.sub("", pashto_raw).strip()
                i += 2
            else:
                i += 1

            verses.append({
                "verse_number": verse_num,
                "arabic": arabic_clean,
                "pashto": pashto,
            })
            continue

        i += 1

    return verses


# ─────────────────────────────────────────────────────────────────────────────
# SQLite schema + writer
# ─────────────────────────────────────────────────────────────────────────────

SCHEMA = """
CREATE TABLE IF NOT EXISTS surahs (
    id                  INTEGER PRIMARY KEY,
    number              INTEGER NOT NULL UNIQUE,
    name_arabic         TEXT    NOT NULL,
    name_pashto         TEXT    NOT NULL DEFAULT '',
    name_dari           TEXT    NOT NULL DEFAULT '',
    name_transliteration TEXT   NOT NULL DEFAULT '',
    total_verses        INTEGER NOT NULL DEFAULT 0,
    revelation_type     TEXT    NOT NULL DEFAULT 'meccan'
);

CREATE TABLE IF NOT EXISTS verses (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    surah_id     INTEGER NOT NULL REFERENCES surahs(id),
    verse_number INTEGER NOT NULL,
    arabic       TEXT    NOT NULL DEFAULT '',
    pashto       TEXT    NOT NULL DEFAULT '',
    dari         TEXT    NOT NULL DEFAULT '',
    UNIQUE(surah_id, verse_number)
);

CREATE INDEX IF NOT EXISTS idx_verses_surah ON verses(surah_id);

CREATE TABLE IF NOT EXISTS bookmarks (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    surah_id     INTEGER NOT NULL REFERENCES surahs(id),
    verse_number INTEGER NOT NULL,
    note         TEXT    DEFAULT '',
    created_at   TEXT    DEFAULT (datetime('now')),
    UNIQUE(surah_id, verse_number)
);

CREATE TABLE IF NOT EXISTS last_read (
    id           INTEGER PRIMARY KEY CHECK (id = 1),
    surah_id     INTEGER NOT NULL REFERENCES surahs(id),
    verse_number INTEGER NOT NULL DEFAULT 1,
    updated_at   TEXT    DEFAULT (datetime('now'))
);
"""


def init_db(db_path: str, append: bool) -> sqlite3.Connection:
    if not append and Path(db_path).exists():
        Path(db_path).unlink()
        print(f"  Removed existing DB at {db_path}")

    conn = sqlite3.connect(db_path)
    conn.executescript(SCHEMA)
    conn.commit()

    # Seed surah metadata (insert or ignore so re-runs are safe)
    conn.executemany(
        """INSERT OR IGNORE INTO surahs
           (number, name_arabic, name_pashto, name_dari, name_transliteration, total_verses, revelation_type)
           VALUES (?,?,?,?,?,?,?)""",
        SURAHS_METADATA,
    )
    conn.commit()
    print(f"  Seeded {len(SURAHS_METADATA)} surah metadata rows")
    return conn


def write_verses(conn: sqlite3.Connection, surah_number: int, verses: list[dict]):
    row = conn.execute("SELECT id FROM surahs WHERE number=?", (surah_number,)).fetchone()
    if row is None:
        raise ValueError(f"Surah {surah_number} not found in metadata table")
    surah_id = row[0]

    inserted = 0
    for v in verses:
        conn.execute(
            """INSERT INTO verses (surah_id, verse_number, arabic, pashto)
               VALUES (?,?,?,?)
               ON CONFLICT(surah_id, verse_number) DO UPDATE SET
                 arabic = excluded.arabic,
                 pashto = excluded.pashto""",
            (surah_id, v["verse_number"], v["arabic"], v["pashto"]),
        )
        inserted += 1
    conn.commit()
    print(f"  Wrote {inserted} verses for surah {surah_number}")


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Parse Quran docx → SQLite")
    parser.add_argument("--docx",         required=True, help="Path to .docx file")
    parser.add_argument("--surah-number", required=True, type=int, help="Surah number (1-114)")
    parser.add_argument("--output",       default="assets/db/quran.db", help="Output DB path")
    parser.add_argument("--append",       action="store_true", help="Append to existing DB")
    args = parser.parse_args()

    docx_path = Path(args.docx)
    if not docx_path.exists():
        print(f"ERROR: docx not found: {docx_path}", file=sys.stderr)
        sys.exit(1)

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"\nParsing: {docx_path}")
    paragraphs = extract_paragraphs(str(docx_path))
    print(f"  Found {len(paragraphs)} paragraphs")

    verses = parse_verses(paragraphs)
    print(f"  Extracted {len(verses)} verses")

    # Show first 3 for verification
    for v in verses[:3]:
        print(f"  [{v['verse_number']}] Arabic: {v['arabic'][:60]}...")
        print(f"       Pashto: {v['pashto'][:60]}...")

    print(f"\nWriting DB: {output_path}")
    conn = init_db(str(output_path), args.append)
    write_verses(conn, args.surah_number, verses)
    conn.close()

    size_kb = output_path.stat().st_size / 1024
    print(f"\nDone! DB size: {size_kb:.1f} KB")
    print(f"Path: {output_path.resolve()}\n")


if __name__ == "__main__":
    main()
