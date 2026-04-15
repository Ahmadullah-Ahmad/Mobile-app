#!/usr/bin/env python3
"""
Quran Import Tool
=================
Single script to initialize the DB and import Pashto/Dari translations from .docx files.

Commands:
    init        Create the database with schema + surah metadata + juz data
    pashto      Import Pashto translations from a .docx file
    dari        Import Dari translations from a directory of .docx files

Usage:
    python3 scripts/import_quran.py init
    python3 scripts/import_quran.py pashto --docx "surah.docx" --surah 18
    python3 scripts/import_quran.py dari --dir quran/
    python3 scripts/import_quran.py dari --dir quran/ --surah 2
"""

from __future__ import annotations

import argparse
import re
import sqlite3
import sys
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path
from typing import Optional

# ─────────────────────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────────────────────

DB_PATH = Path(__file__).resolve().parent.parent / "assets" / "db" / "app.db"

ARABIC_INDIC = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")
EXTENDED_ARABIC_INDIC = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")

# ─────────────────────────────────────────────────────────────────────────────
# Regex patterns
# ─────────────────────────────────────────────────────────────────────────────

# Ornamental Quranic brackets ﴿N﴾
ORNAMENTAL_RE = re.compile(r"﴿([۰-۹٠-٩0-9]+)﴾")
# Parenthetical verse number (N) with optional ZWJ/ZWNJ inside
PAREN_RE = re.compile(
    r"[\(（][\u200B-\u200F\u200C\u200D\s]*([۰-۹٠-٩0-9]+)[\u200B-\u200F\u200C\u200D\s]*[\)）]"
)
# Trailing translation number e.g. (۱) or (1) at end of line
TRANS_NUM_RE = re.compile(r"\s*[\(（]\s*([۰-۹٠-٩0-9]+)\s*[\)）]\s*$")
# Detect Arabic verse paragraph (has ornamental brackets)
IS_ARABIC_VERSE = re.compile(r"﴿[۰-۹٠-٩0-9]+﴾")
# Inline number that may be glued to next Arabic verse
INLINE_NUM_RE = re.compile(
    r"[\(（][\u200B-\u200F\u200C\u200D]?([۰-۹٠-٩0-9]+)[\u200B-\u200F\u200C\u200D]?[\)）]"
)
# Footer lines to skip
FOOTER_RE = re.compile(r"صدق الله|و من الله التوفيق")
# Arabic diacritics (tashkeel)
TASHKEEL_RE = re.compile(r"[\u0610-\u061A\u064B-\u065F\u0670]")
# Info line keywords (to skip header paragraphs)
INFO_WORDS = re.compile(r"آيت|آیت|رکوع|نازل شده|كلمه|کلمه|حرف")


def normalize_number(s: str) -> str:
    return s.translate(ARABIC_INDIC).translate(EXTENDED_ARABIC_INDIC)


def strip_tashkeel(s: str) -> str:
    return TASHKEEL_RE.sub("", s)


# ─────────────────────────────────────────────────────────────────────────────
# Surah metadata (all 114)
# (number, name_arabic, name_pashto, name_dari, transliteration, total_verses, revelation)
# ─────────────────────────────────────────────────────────────────────────────

SURAHS = [
    (1,   "الفاتحة",      "د الفاتحې سورت",     "سوره فاتحه",       "Al-Fatiha",        7,   "meccan"),
    (2,   "البقرة",       "د البقرې سورت",      "سوره بقره",        "Al-Baqara",        286, "medinan"),
    (3,   "آل عمران",     "د آل عمران سورت",    "سوره آل عمران",    "Aal-e-Imran",      200, "medinan"),
    (4,   "النساء",       "د النساء سورت",      "سوره نساء",        "An-Nisa",          176, "medinan"),
    (5,   "المائدة",      "د المائدې سورت",     "سوره مائده",       "Al-Ma'ida",        120, "medinan"),
    (6,   "الأنعام",      "د الأنعام سورت",     "سوره انعام",       "Al-An'am",         165, "meccan"),
    (7,   "الأعراف",      "د الأعراف سورت",     "سوره اعراف",       "Al-A'raf",         206, "meccan"),
    (8,   "الأنفال",      "د الأنفال سورت",     "سوره انفال",       "Al-Anfal",         75,  "medinan"),
    (9,   "التوبة",       "د التوبې سورت",      "سوره توبه",        "At-Tawba",         129, "medinan"),
    (10,  "يونس",         "د یونس سورت",        "سوره یونس",        "Yunus",            109, "meccan"),
    (11,  "هود",          "د هود سورت",         "سوره هود",         "Hud",              123, "meccan"),
    (12,  "يوسف",         "د یوسف سورت",        "سوره یوسف",        "Yusuf",            111, "meccan"),
    (13,  "الرعد",        "د الرعد سورت",       "سوره رعد",         "Ar-Ra'd",          43,  "medinan"),
    (14,  "إبراهيم",      "د ابراهیم سورت",     "سوره ابراهیم",     "Ibrahim",          52,  "meccan"),
    (15,  "الحجر",        "د الحجر سورت",       "سوره حجر",         "Al-Hijr",          99,  "meccan"),
    (16,  "النحل",        "د النحل سورت",       "سوره نحل",         "An-Nahl",          128, "meccan"),
    (17,  "الإسراء",      "د الإسراء سورت",     "سوره اسراء",       "Al-Isra",          111, "meccan"),
    (18,  "الكهف",        "د الکهف سورت",       "سوره کهف",         "Al-Kahf",          110, "meccan"),
    (19,  "مريم",         "د مریم سورت",        "سوره مریم",        "Maryam",           98,  "meccan"),
    (20,  "طه",           "د طه سورت",          "سوره طه",          "Ta-Ha",            135, "meccan"),
    (21,  "الأنبياء",     "د الأنبیاء سورت",    "سوره انبیاء",      "Al-Anbiya",        112, "meccan"),
    (22,  "الحج",         "د الحج سورت",        "سوره حج",          "Al-Hajj",          78,  "medinan"),
    (23,  "المؤمنون",     "د المؤمنون سورت",    "سوره مؤمنون",      "Al-Mu'minun",      118, "meccan"),
    (24,  "النور",        "د النور سورت",       "سوره نور",         "An-Nur",           64,  "medinan"),
    (25,  "الفرقان",      "د الفرقان سورت",     "سوره فرقان",       "Al-Furqan",        77,  "meccan"),
    (26,  "الشعراء",      "د الشعراء سورت",     "سوره شعراء",       "Ash-Shu'ara",      227, "meccan"),
    (27,  "النمل",        "د النمل سورت",       "سوره نمل",         "An-Naml",          93,  "meccan"),
    (28,  "القصص",        "د القصص سورت",       "سوره قصص",         "Al-Qasas",         88,  "meccan"),
    (29,  "العنكبوت",     "د العنکبوت سورت",    "سوره عنکبوت",      "Al-Ankabut",       69,  "meccan"),
    (30,  "الروم",        "د الروم سورت",       "سوره روم",         "Ar-Rum",           60,  "meccan"),
    (31,  "لقمان",        "د لقمان سورت",       "سوره لقمان",       "Luqman",           34,  "meccan"),
    (32,  "السجدة",       "د السجدې سورت",      "سوره سجده",        "As-Sajda",         30,  "meccan"),
    (33,  "الأحزاب",      "د الأحزاب سورت",     "سوره احزاب",       "Al-Ahzab",         73,  "medinan"),
    (34,  "سبأ",          "د سبا سورت",         "سوره سبا",         "Saba",             54,  "meccan"),
    (35,  "فاطر",         "د فاطر سورت",        "سوره فاطر",        "Fatir",            45,  "meccan"),
    (36,  "يس",           "د یاسین سورت",       "سوره یاسین",       "Ya-Sin",           83,  "meccan"),
    (37,  "الصافات",      "د الصافات سورت",     "سوره صافات",       "As-Saffat",        182, "meccan"),
    (38,  "ص",            "د صاد سورت",         "سوره صاد",         "Sad",              88,  "meccan"),
    (39,  "الزمر",        "د الزمر سورت",       "سوره زمر",         "Az-Zumar",         75,  "meccan"),
    (40,  "غافر",         "د غافر سورت",        "سوره غافر",        "Ghafir",           85,  "meccan"),
    (41,  "فصلت",         "د فصلت سورت",        "سوره فصلت",        "Fussilat",         54,  "meccan"),
    (42,  "الشورى",       "د الشورى سورت",      "سوره شوری",        "Ash-Shura",        53,  "meccan"),
    (43,  "الزخرف",       "د الزخرف سورت",      "سوره زخرف",        "Az-Zukhruf",       89,  "meccan"),
    (44,  "الدخان",       "د الدخان سورت",      "سوره دخان",        "Ad-Dukhan",        59,  "meccan"),
    (45,  "الجاثية",      "د الجاثیې سورت",     "سوره جاثیه",       "Al-Jathiya",       37,  "meccan"),
    (46,  "الأحقاف",      "د الأحقاف سورت",     "سوره احقاف",       "Al-Ahqaf",         35,  "meccan"),
    (47,  "محمد",         "د محمد سورت",        "سوره محمد",        "Muhammad",         38,  "medinan"),
    (48,  "الفتح",        "د الفتح سورت",       "سوره فتح",         "Al-Fath",          29,  "medinan"),
    (49,  "الحجرات",      "د الحجرات سورت",     "سوره حجرات",       "Al-Hujurat",       18,  "medinan"),
    (50,  "ق",            "د قاف سورت",         "سوره قاف",         "Qaf",              45,  "meccan"),
    (51,  "الذاريات",     "د الذاریات سورت",    "سوره ذاریات",      "Adh-Dhariyat",     60,  "meccan"),
    (52,  "الطور",        "د الطور سورت",       "سوره طور",         "At-Tur",           49,  "meccan"),
    (53,  "النجم",        "د النجم سورت",       "سوره نجم",         "An-Najm",          62,  "meccan"),
    (54,  "القمر",        "د القمر سورت",       "سوره قمر",         "Al-Qamar",         55,  "meccan"),
    (55,  "الرحمن",       "د الرحمن سورت",      "سوره رحمن",        "Ar-Rahman",        78,  "medinan"),
    (56,  "الواقعة",      "د الواقعې سورت",     "سوره واقعه",       "Al-Waqi'a",        96,  "meccan"),
    (57,  "الحديد",       "د الحدید سورت",      "سوره حدید",        "Al-Hadid",         29,  "medinan"),
    (58,  "المجادلة",     "د المجادلې سورت",    "سوره مجادله",      "Al-Mujadila",      22,  "medinan"),
    (59,  "الحشر",        "د الحشر سورت",       "سوره حشر",         "Al-Hashr",         24,  "medinan"),
    (60,  "الممتحنة",     "د الممتحنې سورت",    "سوره ممتحنه",      "Al-Mumtahana",     13,  "medinan"),
    (61,  "الصف",         "د الصف سورت",        "سوره صف",          "As-Saf",           14,  "medinan"),
    (62,  "الجمعة",       "د الجمعې سورت",      "سوره جمعه",        "Al-Jumu'a",        11,  "medinan"),
    (63,  "المنافقون",    "د المنافقون سورت",   "سوره منافقون",     "Al-Munafiqun",     11,  "medinan"),
    (64,  "التغابن",      "د التغابن سورت",     "سوره تغابن",       "At-Taghabun",      18,  "medinan"),
    (65,  "الطلاق",       "د الطلاق سورت",      "سوره طلاق",        "At-Talaq",         12,  "medinan"),
    (66,  "التحريم",      "د التحریم سورت",     "سوره تحریم",       "At-Tahrim",        12,  "medinan"),
    (67,  "الملك",        "د الملک سورت",       "سوره ملک",         "Al-Mulk",          30,  "meccan"),
    (68,  "القلم",        "د القلم سورت",       "سوره قلم",         "Al-Qalam",         52,  "meccan"),
    (69,  "الحاقة",       "د الحاقې سورت",      "سوره حاقه",        "Al-Haqqah",        52,  "meccan"),
    (70,  "المعارج",      "د المعارج سورت",     "سوره معارج",       "Al-Ma'arij",       44,  "meccan"),
    (71,  "نوح",          "د نوح سورت",         "سوره نوح",         "Nuh",              28,  "meccan"),
    (72,  "الجن",         "د الجن سورت",        "سوره جن",          "Al-Jinn",          28,  "meccan"),
    (73,  "المزمل",       "د المزمل سورت",      "سوره مزمل",        "Al-Muzzammil",     20,  "meccan"),
    (74,  "المدثر",       "د المدثر سورت",      "سوره مدثر",        "Al-Muddaththir",   56,  "meccan"),
    (75,  "القيامة",      "د القیامې سورت",     "سوره قیامه",       "Al-Qiyama",        40,  "meccan"),
    (76,  "الإنسان",      "د الانسان سورت",     "سوره انسان",       "Al-Insan",         31,  "medinan"),
    (77,  "المرسلات",     "د المرسلات سورت",    "سوره مرسلات",      "Al-Mursalat",      50,  "meccan"),
    (78,  "النبأ",        "د النبا سورت",       "سوره نبا",         "An-Naba",          40,  "meccan"),
    (79,  "النازعات",     "د النازعات سورت",    "سوره نازعات",      "An-Nazi'at",       46,  "meccan"),
    (80,  "عبس",          "د عبس سورت",         "سوره عبس",         "Abasa",            42,  "meccan"),
    (81,  "التكوير",      "د التکویر سورت",     "سوره تکویر",       "At-Takwir",        29,  "meccan"),
    (82,  "الانفطار",     "د الانفطار سورت",    "سوره انفطار",      "Al-Infitar",       19,  "meccan"),
    (83,  "المطففين",     "د المطففین سورت",    "سوره مطففین",      "Al-Mutaffifin",    36,  "meccan"),
    (84,  "الانشقاق",     "د الانشقاق سورت",    "سوره انشقاق",      "Al-Inshiqaq",      25,  "meccan"),
    (85,  "البروج",       "د البروج سورت",      "سوره بروج",        "Al-Buruj",         22,  "meccan"),
    (86,  "الطارق",       "د الطارق سورت",      "سوره طارق",        "At-Tariq",         17,  "meccan"),
    (87,  "الأعلى",       "د الأعلى سورت",      "سوره اعلی",        "Al-A'la",          19,  "meccan"),
    (88,  "الغاشية",      "د الغاشیې سورت",     "سوره غاشیه",       "Al-Ghashiya",      26,  "meccan"),
    (89,  "الفجر",        "د الفجر سورت",       "سوره فجر",         "Al-Fajr",          30,  "meccan"),
    (90,  "البلد",        "د البلد سورت",       "سوره بلد",         "Al-Balad",         20,  "meccan"),
    (91,  "الشمس",        "د الشمس سورت",       "سوره شمس",         "Ash-Shams",        15,  "meccan"),
    (92,  "الليل",        "د اللیل سورت",       "سوره لیل",         "Al-Layl",          21,  "meccan"),
    (93,  "الضحى",        "د الضحى سورت",       "سوره ضحی",         "Ad-Duha",          11,  "meccan"),
    (94,  "الشرح",        "د الشرح سورت",       "سوره شرح",         "Ash-Sharh",        8,   "meccan"),
    (95,  "التين",        "د التین سورت",       "سوره تین",         "At-Tin",           8,   "meccan"),
    (96,  "العلق",        "د العلق سورت",       "سوره علق",         "Al-Alaq",          19,  "meccan"),
    (97,  "القدر",        "د القدر سورت",       "سوره قدر",         "Al-Qadr",          5,   "meccan"),
    (98,  "البينة",       "د البینې سورت",      "سوره بینه",        "Al-Bayyina",       8,   "medinan"),
    (99,  "الزلزلة",      "د الزلزلې سورت",     "سوره زلزله",       "Az-Zalzala",       8,   "medinan"),
    (100, "العاديات",     "د العادیات سورت",    "سوره عادیات",      "Al-Adiyat",        11,  "meccan"),
    (101, "القارعة",      "د القارعې سورت",     "سوره قارعه",       "Al-Qari'a",        11,  "meccan"),
    (102, "التكاثر",      "د التکاثر سورت",     "سوره تکاثر",       "At-Takathur",      8,   "meccan"),
    (103, "العصر",        "د العصر سورت",       "سوره عصر",         "Al-Asr",           3,   "meccan"),
    (104, "الهمزة",       "د الهمزې سورت",      "سوره همزه",        "Al-Humaza",        9,   "meccan"),
    (105, "الفيل",        "د الفیل سورت",       "سوره فیل",         "Al-Fil",           5,   "meccan"),
    (106, "قريش",         "د قریش سورت",        "سوره قریش",        "Quraysh",          4,   "meccan"),
    (107, "الماعون",      "د الماعون سورت",     "سوره ماعون",       "Al-Ma'un",         7,   "meccan"),
    (108, "الكوثر",       "د الکوثر سورت",      "سوره کوثر",        "Al-Kawthar",       3,   "meccan"),
    (109, "الكافرون",     "د الکافرون سورت",    "سوره کافرون",      "Al-Kafirun",       6,   "meccan"),
    (110, "النصر",        "د النصر سورت",       "سوره نصر",         "An-Nasr",          3,   "medinan"),
    (111, "المسد",        "د المسد سورت",       "سوره مسد",         "Al-Masad",         5,   "meccan"),
    (112, "الإخلاص",      "د الاخلاص سورت",     "سوره اخلاص",       "Al-Ikhlas",        4,   "meccan"),
    (113, "الفلق",        "د الفلق سورت",       "سوره فلق",         "Al-Falaq",         5,   "meccan"),
    (114, "الناس",        "د الناس سورت",       "سوره ناس",         "An-Nas",           6,   "meccan"),
]

# ─────────────────────────────────────────────────────────────────────────────
# Juz data (30 standard boundaries + names)
# ─────────────────────────────────────────────────────────────────────────────

JUZ_DATA = [
    # (number, start_surah, start_verse, end_surah, end_verse, name_arabic, name_pashto, name_dari)
    (1,  1, 1,   2, 141,   "الٓمٓ",                "الم",              "الم"),
    (2,  2, 142, 2, 252,   "سَيَقُولُ",            "سيقول",            "سیقول"),
    (3,  2, 253, 3, 92,    "تِلْكَ الرُّسُلُ",      "تلک الرسل",        "تلک الرسل"),
    (4,  3, 93,  4, 23,    "لَنْ تَنَالُوا",        "لن تنالوا",        "لن تنالوا"),
    (5,  4, 24,  4, 147,   "وَالْمُحْصَنَاتُ",      "والمحصنات",        "والمحصنات"),
    (6,  4, 148, 5, 81,    "لَا يُحِبُّ اللَّهُ",    "لا یحب الله",      "لا یحب الله"),
    (7,  5, 82,  6, 110,   "وَإِذَا سَمِعُوا",      "واذا سمعوا",       "واذا سمعوا"),
    (8,  6, 111, 7, 87,    "وَلَوْ أَنَّنَا",        "ولو اننا",         "ولو اننا"),
    (9,  7, 88,  8, 40,    "قَالَ الْمَلَأُ",        "قال الملأ",        "قال الملأ"),
    (10, 8, 41,  9, 92,    "وَاعْلَمُوا",          "واعلموا",          "واعلموا"),
    (11, 9, 93,  11, 5,    "يَعْتَذِرُونَ",         "یعتذرون",          "یعتذرون"),
    (12, 11, 6,  12, 52,   "وَمَا مِنْ دَابَّةٍ",    "وما من دابة",      "وما من دابة"),
    (13, 12, 53, 14, 52,   "وَمَا أُبَرِّئُ",        "وما ابرئ",         "وما ابرئ"),
    (14, 15, 1,  16, 128,  "رُبَمَا",              "ربما",             "ربما"),
    (15, 17, 1,  18, 74,   "سُبْحَانَ الَّذِي",      "سبحان الذی",       "سبحان الذی"),
    (16, 18, 75, 20, 135,  "قَالَ أَلَمْ",          "قال الم",          "قال الم"),
    (17, 21, 1,  22, 78,   "اقْتَرَبَ",            "اقترب",            "اقترب"),
    (18, 23, 1,  25, 20,   "قَدْ أَفْلَحَ",          "قد افلح",          "قد افلح"),
    (19, 25, 21, 27, 55,   "وَقَالَ الَّذِينَ",      "وقال الذین",       "وقال الذین"),
    (20, 27, 56, 29, 45,   "أَمَّنْ خَلَقَ",         "امن خلق",          "امن خلق"),
    (21, 29, 46, 33, 30,   "اتْلُ مَا أُوحِيَ",     "اتل ما اوحی",     "اتل ما اوحی"),
    (22, 33, 31, 36, 27,   "وَمَنْ يَقْنُتْ",        "ومن یقنت",         "ومن یقنت"),
    (23, 36, 28, 39, 31,   "وَمَا لِيَ",            "وما لی",           "وما لی"),
    (24, 39, 32, 41, 46,   "فَمَنْ أَظْلَمُ",        "فمن اظلم",         "فمن اظلم"),
    (25, 41, 47, 45, 37,   "إِلَيْهِ يُرَدُّ",       "الیه یرد",         "الیه یرد"),
    (26, 46, 1,  51, 30,   "حٰمٓ",                 "حم",               "حم"),
    (27, 51, 31, 57, 29,   "قَالَ فَمَا خَطْبُكُمْ",  "قال فما خطبکم",    "قال فما خطبکم"),
    (28, 58, 1,  66, 12,   "قَدْ سَمِعَ اللَّهُ",    "قد سمع الله",      "قد سمع الله"),
    (29, 67, 1,  77, 50,   "تَبَارَكَ الَّذِي",      "تبارک الذی",       "تبارک الذی"),
    (30, 78, 1,  114, 6,   "عَمَّ يَتَسَاءَلُونَ",    "عم یتسائلون",      "عم یتسائلون"),
]

# ─────────────────────────────────────────────────────────────────────────────
# DB Schema
# ─────────────────────────────────────────────────────────────────────────────

SCHEMA = """
CREATE TABLE IF NOT EXISTS surahs (
    id                   INTEGER PRIMARY KEY,
    number               INTEGER NOT NULL UNIQUE,
    name_arabic          TEXT    NOT NULL,
    name_pashto          TEXT    NOT NULL DEFAULT '',
    name_dari            TEXT    NOT NULL DEFAULT '',
    name_transliteration TEXT    NOT NULL DEFAULT '',
    total_verses         INTEGER NOT NULL DEFAULT 0,
    revelation_type      TEXT    NOT NULL DEFAULT 'meccan'
);

CREATE TABLE IF NOT EXISTS verses (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    surah_id     INTEGER NOT NULL REFERENCES surahs(id),
    verse_number INTEGER NOT NULL,
    arabic       TEXT    NOT NULL DEFAULT '',
    pashto       TEXT    NOT NULL DEFAULT '',
    dari         TEXT    NOT NULL DEFAULT '',
    juz_number   INTEGER,
    UNIQUE(surah_id, verse_number)
);

CREATE INDEX IF NOT EXISTS idx_verses_surah ON verses(surah_id);
CREATE INDEX IF NOT EXISTS idx_verses_juz   ON verses(juz_number);

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
    juz_number   INTEGER DEFAULT NULL,
    updated_at   TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS juz (
    number       INTEGER PRIMARY KEY,
    start_surah  INTEGER NOT NULL,
    start_verse  INTEGER NOT NULL,
    end_surah    INTEGER NOT NULL,
    end_verse    INTEGER NOT NULL,
    name_arabic  TEXT NOT NULL DEFAULT '',
    name_pashto  TEXT NOT NULL DEFAULT '',
    name_dari    TEXT NOT NULL DEFAULT ''
);
"""

# ─────────────────────────────────────────────────────────────────────────────
# Docx extraction
# ─────────────────────────────────────────────────────────────────────────────

def extract_paragraphs(docx_path: str) -> list[str]:
    """Extract non-empty paragraph text from a .docx file."""
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
# Pashto parser (Arabic ﴿N﴾ followed by Pashto translation paragraph)
# ─────────────────────────────────────────────────────────────────────────────

def split_mixed_paragraphs(paras: list[str]) -> list[str]:
    """Split paragraphs where Pashto translation (N) and next Arabic verse are glued together."""
    result = []
    for para in paras:
        if not IS_ARABIC_VERSE.search(para):
            result.append(para)
            continue
        split_done = False
        for m in INLINE_NUM_RE.finditer(para):
            after = para[m.end():]
            if after.strip() and IS_ARABIC_VERSE.search(after):
                result.append(para[:m.end()].strip())
                result.append(after.strip())
                split_done = True
                break
        if not split_done:
            result.append(para)
    return result


def parse_pashto_verses(paragraphs: list[str]) -> list[dict]:
    """
    Parse (verse_number, arabic, pashto) from paragraphs.
    Expects: Arabic verse with ﴿N﴾ → next paragraph is Pashto translation.
    """
    paragraphs = split_mixed_paragraphs(paragraphs)
    verses: list[dict] = []

    i = 0
    while i < len(paragraphs):
        para = paragraphs[i]

        # Bismillah (unnumbered)
        if "بسم" in para and "الله" in para and "الرحمن" in para and not IS_ARABIC_VERSE.search(para):
            bismillah_arabic = para
            bismillah_pashto = ""
            if i + 1 < len(paragraphs) and not IS_ARABIC_VERSE.search(paragraphs[i + 1]):
                bismillah_pashto = paragraphs[i + 1]
                i += 2
            else:
                i += 1
            verses.append({"verse_number": 0, "arabic": bismillah_arabic, "pashto": bismillah_pashto})
            continue

        # Numbered verse
        if IS_ARABIC_VERSE.search(para):
            num_match = ORNAMENTAL_RE.search(para)
            verse_num = int(normalize_number(num_match.group(1))) if num_match else len(verses)
            arabic_clean = ORNAMENTAL_RE.sub("", para).strip()

            pashto = ""
            if i + 1 < len(paragraphs) and not IS_ARABIC_VERSE.search(paragraphs[i + 1]):
                pashto = TRANS_NUM_RE.sub("", paragraphs[i + 1]).strip()
                i += 2
            else:
                i += 1

            verses.append({"verse_number": verse_num, "arabic": arabic_clean, "pashto": pashto})
            continue

        i += 1

    return verses


# ─────────────────────────────────────────────────────────────────────────────
# Dari parser (handles ﴿N﴾ format and paren-only (N)(N) format)
# ─────────────────────────────────────────────────────────────────────────────

def find_markers(text: str) -> list[tuple[int, int, int, str]]:
    """Find all verse-number markers. Returns (start, end, verse_num, type)."""
    markers = []
    for m in ORNAMENTAL_RE.finditer(text):
        markers.append((m.start(), m.end(), int(normalize_number(m.group(1))), "ornamental"))
    for m in PAREN_RE.finditer(text):
        markers.append((m.start(), m.end(), int(normalize_number(m.group(1))), "paren"))
    markers.sort(key=lambda x: x[0])
    return markers


def parse_dari_verses(paragraphs: list[str]) -> list[dict]:
    """
    Parse (verse_number, arabic, dari) from paragraphs.
    Handles two docx formats:
      A) ﴿N﴾ ornamental brackets for Arabic, (N) for Dari
      B) Paren-only: two (N) per verse — first = Arabic, second = Dari
    """
    verses = []

    # Detect and extract Bismillah
    content_start = 0
    bismillah_arabic = ""
    bismillah_dari = ""

    for i, para in enumerate(paragraphs):
        plain = strip_tashkeel(para)
        if "بسم" in plain and "الله" in plain and "الرحمن" in plain:
            bismillah_arabic = para
            if i + 1 < len(paragraphs) and not ORNAMENTAL_RE.search(paragraphs[i + 1]):
                next_para = paragraphs[i + 1]
                if not PAREN_RE.search(next_para) or "به نام" in next_para:
                    bismillah_dari = next_para
                    content_start = i + 2
                else:
                    content_start = i + 1
            else:
                content_start = i + 1
            break
        content_start = i + 1

    if not bismillah_arabic:
        content_start = 0

    if bismillah_arabic:
        verses.append({"verse_number": 0, "arabic": bismillah_arabic, "dari": bismillah_dari})

    # Skip info/header lines until first real verse
    first_verse_idx = content_start
    for j in range(content_start, len(paragraphs)):
        para = paragraphs[j]
        if FOOTER_RE.search(para):
            break
        if ORNAMENTAL_RE.search(para):
            first_verse_idx = j
            break
        paren_matches = list(PAREN_RE.finditer(para))
        if paren_matches and not INFO_WORDS.search(para):
            nums = [int(normalize_number(m.group(1))) for m in paren_matches]
            if any(n <= 3 for n in nums):
                first_verse_idx = j
                break
    else:
        first_verse_idx = content_start

    # Join remaining paragraphs, skip footers
    content_paras = []
    for para in paragraphs[first_verse_idx:]:
        if FOOTER_RE.search(para):
            break
        content_paras.append(para)

    if not content_paras:
        return verses

    full_text = "\n".join(content_paras)
    markers = find_markers(full_text)
    if not markers:
        print("    WARNING: No verse markers found!")
        return verses

    max_verse = max(m[2] for m in markers if m[2] <= 300) if markers else 300
    markers = [m for m in markers if m[2] <= max_verse]

    has_ornamental = any(m[3] == "ornamental" for m in markers)

    if has_ornamental:
        # Strategy A: ornamental = Arabic, paren = Dari
        arabic_blocks: dict[int, list[str]] = {}
        dari_blocks: dict[int, list[str]] = {}

        prev_end = 0
        for m_start, m_end, m_num, m_type in markers:
            block_text = full_text[prev_end:m_start].strip()
            block_text = re.sub(r"\s*\n\s*", " ", block_text).strip()
            block_text = ORNAMENTAL_RE.sub("", block_text).strip()
            block_text = PAREN_RE.sub("", block_text).strip()

            if block_text:
                if m_type == "ornamental":
                    arabic_blocks.setdefault(m_num, []).append(block_text)
                else:
                    dari_blocks.setdefault(m_num, []).append(block_text)
            prev_end = m_end

        all_nums = sorted(set(list(arabic_blocks.keys()) + list(dari_blocks.keys())))
        for num in all_nums:
            verses.append({
                "verse_number": num,
                "arabic": " ".join(arabic_blocks.get(num, [])),
                "dari": " ".join(dari_blocks.get(num, [])),
            })
    else:
        # Strategy B: paren-only — two (N) per verse
        verse_markers: dict[int, list[tuple]] = defaultdict(list)
        for m in markers:
            verse_markers[m[2]].append(m)

        for num in sorted(verse_markers.keys()):
            mlist = verse_markers[num]
            if len(mlist) >= 2:
                m1, m2 = mlist[0], mlist[1]
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

                verses.append({"verse_number": num, "arabic": arabic_clean, "dari": dari_clean})

    return verses


# ─────────────────────────────────────────────────────────────────────────────
# DB helpers
# ─────────────────────────────────────────────────────────────────────────────

def get_surah_id(conn: sqlite3.Connection, surah_number: int) -> int:
    row = conn.execute("SELECT id FROM surahs WHERE number=?", (surah_number,)).fetchone()
    if row is None:
        raise ValueError(f"Surah {surah_number} not found in surahs table")
    return row[0]


def init_db(db_path: Path) -> sqlite3.Connection:
    """Create a fresh database with schema, surah metadata, and juz data."""
    if db_path.exists():
        db_path.unlink()
        print(f"  Removed existing DB at {db_path}")

    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))
    conn.executescript(SCHEMA)

    conn.executemany(
        """INSERT OR IGNORE INTO surahs
           (number, name_arabic, name_pashto, name_dari, name_transliteration, total_verses, revelation_type)
           VALUES (?,?,?,?,?,?,?)""",
        SURAHS,
    )
    conn.executemany(
        """INSERT OR REPLACE INTO juz
           (number, start_surah, start_verse, end_surah, end_verse, name_arabic, name_pashto, name_dari)
           VALUES (?,?,?,?,?,?,?,?)""",
        JUZ_DATA,
    )
    conn.commit()
    print(f"  Seeded {len(SURAHS)} surahs + {len(JUZ_DATA)} juz")
    return conn


def write_pashto(conn: sqlite3.Connection, surah_number: int, verses: list[dict]) -> int:
    """Insert/update Arabic + Pashto for a surah. Preserves existing Dari."""
    surah_id = get_surah_id(conn, surah_number)
    for v in verses:
        conn.execute(
            """INSERT INTO verses (surah_id, verse_number, arabic, pashto)
               VALUES (?, ?, ?, ?)
               ON CONFLICT(surah_id, verse_number) DO UPDATE SET
                 arabic = excluded.arabic,
                 pashto = excluded.pashto""",
            (surah_id, v["verse_number"], v["arabic"], v["pashto"]),
        )
    conn.commit()
    return len(verses)


def write_dari(conn: sqlite3.Connection, surah_number: int, verses: list[dict]) -> int:
    """Insert/update Arabic + Dari for a surah. Preserves existing Pashto."""
    surah_id = get_surah_id(conn, surah_number)
    for v in verses:
        conn.execute(
            """INSERT INTO verses (surah_id, verse_number, arabic, pashto, dari)
               VALUES (?, ?, ?, '', ?)
               ON CONFLICT(surah_id, verse_number) DO UPDATE SET
                 arabic = CASE WHEN excluded.arabic != '' THEN excluded.arabic ELSE verses.arabic END,
                 dari = excluded.dari""",
            (surah_id, v["verse_number"], v["arabic"], v["dari"]),
        )
    conn.commit()
    return len(verses)


def compute_juz_numbers(conn: sqlite3.Connection):
    """Set juz_number on every verse row based on the juz table boundaries."""
    juz_rows = conn.execute(
        "SELECT number, start_surah, start_verse, end_surah, end_verse FROM juz ORDER BY number"
    ).fetchall()

    for juz_num, ss, sv, es, ev in juz_rows:
        conn.execute(
            """UPDATE verses SET juz_number = ?
               WHERE (
                 (surah_id > (SELECT id FROM surahs WHERE number = ?) OR
                  (surah_id = (SELECT id FROM surahs WHERE number = ?) AND verse_number >= ?))
                 AND
                 (surah_id < (SELECT id FROM surahs WHERE number = ?) OR
                  (surah_id = (SELECT id FROM surahs WHERE number = ?) AND verse_number <= ?))
               )""",
            (juz_num, ss, ss, sv, es, es, ev),
        )
    conn.commit()
    updated = conn.execute("SELECT COUNT(*) FROM verses WHERE juz_number IS NOT NULL").fetchone()[0]
    print(f"  Assigned juz_number to {updated} verses")


# ─────────────────────────────────────────────────────────────────────────────
# Surah number from filename (e.g. "2.docx", "1 ترجمه سوره.docx")
# ─────────────────────────────────────────────────────────────────────────────

SURAH_NUM_END_RE = re.compile(r"(\d+)\.docx$", re.IGNORECASE)
SURAH_NUM_START_RE = re.compile(r"^(\d+)\s", re.IGNORECASE)

def extract_surah_number(filename: str) -> Optional[int]:
    m = SURAH_NUM_END_RE.search(filename)
    if m:
        return int(m.group(1))
    m = SURAH_NUM_START_RE.search(filename)
    if m:
        return int(m.group(1))
    return None


# ─────────────────────────────────────────────────────────────────────────────
# CLI commands
# ─────────────────────────────────────────────────────────────────────────────

def cmd_init(args):
    print(f"\nInitializing DB: {args.db}")
    conn = init_db(Path(args.db))
    compute_juz_numbers(conn)
    conn.close()
    size_kb = Path(args.db).stat().st_size / 1024
    print(f"  Done! DB size: {size_kb:.1f} KB\n")


def cmd_pashto(args):
    docx_path = Path(args.docx)
    if not docx_path.exists():
        print(f"ERROR: File not found: {docx_path}", file=sys.stderr)
        sys.exit(1)

    db_path = Path(args.db)
    if not db_path.exists():
        print(f"ERROR: DB not found: {db_path}. Run 'init' first.", file=sys.stderr)
        sys.exit(1)

    print(f"\nParsing Pashto: {docx_path}")
    paragraphs = extract_paragraphs(str(docx_path))
    print(f"  Paragraphs: {len(paragraphs)}")

    verses = parse_pashto_verses(paragraphs)
    print(f"  Verses: {len(verses)}")

    for v in verses[:3]:
        print(f"  [{v['verse_number']}] Arabic: {v['arabic'][:60]}...")
        print(f"         Pashto: {v['pashto'][:60]}...")

    conn = sqlite3.connect(str(db_path))
    written = write_pashto(conn, args.surah, verses)
    compute_juz_numbers(conn)
    conn.close()
    print(f"  Wrote {written} verses for surah {args.surah}\n")


def cmd_dari(args):
    docx_dir = Path(args.dir)
    if not docx_dir.is_dir():
        print(f"ERROR: Directory not found: {docx_dir}", file=sys.stderr)
        sys.exit(1)

    db_path = Path(args.db)
    if not db_path.exists():
        print(f"ERROR: DB not found: {db_path}. Run 'init' first.", file=sys.stderr)
        sys.exit(1)

    docx_files = sorted(
        [f for f in docx_dir.glob("*.docx") if not f.name.startswith("~$")],
        key=lambda f: extract_surah_number(f.name) or 999,
    )
    print(f"\nFound {len(docx_files)} docx files in {docx_dir}")

    conn = sqlite3.connect(str(db_path))
    success, errors, skipped = 0, [], 0

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
            print(f"    Verses: {len(verses)}")

            if verses:
                v1 = verses[1] if len(verses) > 1 else verses[0]
                print(f"    [{v1['verse_number']}] Arabic: {v1['arabic'][:50]}...")
                print(f"    [{v1['verse_number']}] Dari:   {v1['dari'][:50]}...")

                meta = conn.execute("SELECT total_verses FROM surahs WHERE number=?", (surah_num,)).fetchone()
                expected = meta[0] if meta else 0
                actual = len([v for v in verses if v["verse_number"] > 0])
                if expected and actual != expected:
                    print(f"    WARNING: Expected {expected} verses, got {actual}")

                written = write_dari(conn, surah_num, verses)
                print(f"    Written: {written} rows")
                success += 1
            else:
                print(f"    WARNING: No verses extracted!")
                errors.append((surah_num, "No verses extracted"))
        except Exception as e:
            print(f"    ERROR: {e}")
            errors.append((surah_num, str(e)))

    compute_juz_numbers(conn)
    conn.close()

    print(f"\n{'='*60}")
    print(f"Results: {success} imported, {skipped} skipped, {len(errors)} errors")
    if errors:
        print("Errors:")
        for num, err in errors:
            print(f"  Surah {num}: {err}")
    print()


def main():
    parser = argparse.ArgumentParser(description="Quran Import Tool")
    parser.add_argument("--db", default=str(DB_PATH), help="SQLite DB path")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("init", help="Create fresh DB with schema + metadata")

    p_pashto = sub.add_parser("pashto", help="Import Pashto translation from a .docx")
    p_pashto.add_argument("--docx", required=True, help="Path to .docx file")
    p_pashto.add_argument("--surah", required=True, type=int, help="Surah number (1-114)")

    p_dari = sub.add_parser("dari", help="Batch import Dari translations from a directory")
    p_dari.add_argument("--dir", required=True, help="Directory with Dari .docx files")
    p_dari.add_argument("--surah", type=int, help="Only process this surah (for testing)")

    args = parser.parse_args()

    if args.command == "init":
        cmd_init(args)
    elif args.command == "pashto":
        cmd_pashto(args)
    elif args.command == "dari":
        cmd_dari(args)


if __name__ == "__main__":
    main()
