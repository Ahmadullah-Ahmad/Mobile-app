# import sqlite3

# conn = sqlite3.connect('assets/db/app.db')

# # Create juz table
# conn.executescript("""
# CREATE TABLE IF NOT EXISTS juz (
#     number          INTEGER PRIMARY KEY,
#     start_surah     INTEGER NOT NULL,
#     start_verse     INTEGER NOT NULL,
#     end_surah       INTEGER NOT NULL,
#     end_verse       INTEGER NOT NULL,
#     name_arabic     TEXT NOT NULL DEFAULT '',
#     name_pashto     TEXT NOT NULL DEFAULT '',
#     name_dari       TEXT NOT NULL DEFAULT ''
# );
# """)

# # Standard 30 Juz boundaries
# # (juz_number, start_surah, start_verse, end_surah, end_verse)
# JUZ_DATA = [
#     (1,  1, 1,   2, 141),
#     (2,  2, 142, 2, 252),
#     (3,  2, 253, 3, 92),
#     (4,  3, 93,  4, 23),
#     (5,  4, 24,  4, 147),
#     (6,  4, 148, 5, 81),
#     (7,  5, 82,  6, 110),
#     (8,  6, 111, 7, 87),
#     (9,  7, 88,  8, 40),
#     (10, 8, 41,  9, 92),
#     (11, 9, 93,  11, 5),
#     (12, 11, 6,  12, 52),
#     (13, 12, 53, 14, 52),
#     (14, 15, 1,  16, 128),
#     (15, 17, 1,  18, 74),
#     (16, 18, 75, 20, 135),
#     (17, 21, 1,  22, 78),
#     (18, 23, 1,  25, 20),
#     (19, 25, 21, 27, 55),
#     (20, 27, 56, 29, 45),
#     (21, 29, 46, 33, 30),
#     (22, 33, 31, 36, 27),
#     (23, 36, 28, 39, 31),
#     (24, 39, 32, 41, 46),
#     (25, 41, 47, 45, 37),
#     (26, 46, 1,  51, 30),
#     (27, 51, 31, 57, 29),
#     (28, 58, 1,  66, 12),
#     (29, 67, 1,  77, 50),
#     (30, 78, 1,  114, 6),
# ]

# # Juz names in Arabic/Pashto/Dari
# JUZ_NAMES = {
#     1:  ("الٓمٓ", "الم", "الم"),
#     2:  ("سَيَقُولُ", "سيقول", "سیقول"),
#     3:  ("تِلْكَ الرُّسُلُ", "تلک الرسل", "تلک الرسل"),
#     4:  ("لَنْ تَنَالُوا", "لن تنالوا", "لن تنالوا"),
#     5:  ("وَالْمُحْصَنَاتُ", "والمحصنات", "والمحصنات"),
#     6:  ("لَا يُحِبُّ اللَّهُ", "لا یحب الله", "لا یحب الله"),
#     7:  ("وَإِذَا سَمِعُوا", "واذا سمعوا", "واذا سمعوا"),
#     8:  ("وَلَوْ أَنَّنَا", "ولو اننا", "ولو اننا"),
#     9:  ("قَالَ الْمَلَأُ", "قال الملأ", "قال الملأ"),
#     10: ("وَاعْلَمُوا", "واعلموا", "واعلموا"),
#     11: ("يَعْتَذِرُونَ", "یعتذرون", "یعتذرون"),
#     12: ("وَمَا مِنْ دَابَّةٍ", "وما من دابة", "وما من دابة"),
#     13: ("وَمَا أُبَرِّئُ", "وما ابرئ", "وما ابرئ"),
#     14: ("رُبَمَا", "ربما", "ربما"),
#     15: ("سُبْحَانَ الَّذِي", "سبحان الذی", "سبحان الذی"),
#     16: ("قَالَ أَلَمْ", "قال الم", "قال الم"),
#     17: ("اقْتَرَبَ", "اقترب", "اقترب"),
#     18: ("قَدْ أَفْلَحَ", "قد افلح", "قد افلح"),
#     19: ("وَقَالَ الَّذِينَ", "وقال الذین", "وقال الذین"),
#     20: ("أَمَّنْ خَلَقَ", "امن خلق", "امن خلق"),
#     21: ("اتْلُ مَا أُوحِيَ", "اتل ما اوحی", "اتل ما اوحی"),
#     22: ("وَمَنْ يَقْنُتْ", "ومن یقنت", "ومن یقنت"),
#     23: ("وَمَا لِيَ", "وما لی", "وما لی"),
#     24: ("فَمَنْ أَظْلَمُ", "فمن اظلم", "فمن اظلم"),
#     25: ("إِلَيْهِ يُرَدُّ", "الیه یرد", "الیه یرد"),
#     26: ("حٰمٓ", "حم", "حم"),
#     27: ("قَالَ فَمَا خَطْبُكُمْ", "قال فما خطبکم", "قال فما خطبکم"),
#     28: ("قَدْ سَمِعَ اللَّهُ", "قد سمع الله", "قد سمع الله"),
#     29: ("تَبَارَكَ الَّذِي", "تبارک الذی", "تبارک الذی"),
#     30: ("عَمَّ يَتَسَاءَلُونَ", "عم یتسائلون", "عم یتسائلون"),
# }

# conn.executemany(
#     """INSERT OR REPLACE INTO juz 
#        (number, start_surah, start_verse, end_surah, end_verse, name_arabic, name_pashto, name_dari)
#        VALUES (?,?,?,?,?,?,?,?)""",
#     [(num, ss, sv, es, ev, *JUZ_NAMES[num]) for num, ss, sv, es, ev in JUZ_DATA]
# )
# conn.commit()

# # Verify
# rows = conn.execute("SELECT COUNT(*) FROM juz").fetchone()
# print(f"Juz table: {rows[0]} rows")

# # Verify a sample
# r = conn.execute("SELECT * FROM juz WHERE number = 30").fetchone()
# print(f"Juz 30: starts at {r[1]}:{r[2]}, ends at {r[3]}:{r[4]}, name: {r[5]}")

# conn.close()
# print("Done!")

import sqlite3
from pathlib import Path
import os

# ── Set the absolute path to your DB ─────────────────────────────
DB_PATH = Path(__file__).resolve().parent.parent / "assets/db/app.db"
print("Using DB file:", DB_PATH)

# ── Check if file exists and permissions ──────────────────────────
if not DB_PATH.exists():
    print("❌ ERROR: DB file NOT FOUND at:", DB_PATH)
    exit(1)

print(f"✅ File exists: {DB_PATH.stat().st_size} bytes")
print(f"📝 Writable: {os.access(DB_PATH, os.W_OK)}")

# ── Connect to the SQLite database ────────────────────────────────
try:
    conn = sqlite3.connect(str(DB_PATH))  # use str() to be safe
    conn.execute("PRAGMA journal_mode=WAL;")  # helps with locking issues
    print("✅ Connected to DB")
except Exception as e:
    print(f"❌ Connection failed: {e}")
    exit(1)

# ── Integrity check ───────────────────────────────────────────────
result = conn.execute("PRAGMA integrity_check;").fetchone()
print(f"🔍 Integrity check: {result[0]}")
if result[0] != "ok":
    print("❌ DB is CORRUPTED! Recreate the database.")
    conn.close()
    exit(1)

# ── Show existing tables ──────────────────────────────────────────
tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
print(f"📋 Existing tables: {[t[0] for t in tables]}")

# ── Create the juz table if it doesn't exist ─────────────────────
conn.executescript("""
CREATE TABLE IF NOT EXISTS juz (
    number          INTEGER PRIMARY KEY,
    start_surah     INTEGER NOT NULL,
    start_verse     INTEGER NOT NULL,
    end_surah       INTEGER NOT NULL,
    end_verse       INTEGER NOT NULL,
    name_arabic     TEXT NOT NULL DEFAULT '',
    name_pashto     TEXT NOT NULL DEFAULT '',
    name_dari       TEXT NOT NULL DEFAULT ''
);
""")
print("✅ Juz table ready")

# ── Standard 30 Juz boundaries ────────────────────────────────────
JUZ_DATA = [
    (1,  1, 1,   2, 141), (2,  2, 142, 2, 252), (3,  2, 253, 3, 92),
    (4,  3, 93,  4, 23),  (5,  4, 24,  4, 147), (6,  4, 148, 5, 81),
    (7,  5, 82,  6, 110), (8,  6, 111, 7, 87),  (9,  7, 88,  8, 40),
    (10, 8, 41,  9, 92),  (11, 9, 93,  11, 5),  (12, 11, 6,  12, 52),
    (13, 12, 53, 14, 52), (14, 15, 1,  16, 128),(15, 17, 1,  18, 74),
    (16, 18, 75, 20, 135),(17, 21, 1,  22, 78), (18, 23, 1,  25, 20),
    (19, 25, 21, 27, 55), (20, 27, 56, 29, 45), (21, 29, 46, 33, 30),
    (22, 33, 31, 36, 27), (23, 36, 28, 39, 31), (24, 39, 32, 41, 46),
    (25, 41, 47, 45, 37), (26, 46, 1,  51, 30), (27, 51, 31, 57, 29),
    (28, 58, 1,  66, 12), (29, 67, 1,  77, 50), (30, 78, 1,  114, 6),
]

# ── Juz names in Arabic/Pashto/Dari ──────────────────────────────
JUZ_NAMES = {
    1:  ("الٓمٓ", "الم", "الم"),
    2:  ("سَيَقُولُ", "سيقول", "سیقول"),
    3:  ("تِلْكَ الرُّسُلُ", "تلک الرسل", "تلک الرسل"),
    4:  ("لَنْ تَنَالُوا", "لن تنالوا", "لن تنالوا"),
    5:  ("وَالْمُحْصَنَاتُ", "والمحصنات", "والمحصنات"),
    6:  ("لَا يُحِبُّ اللَّهُ", "لا یحب الله", "لا یحب الله"),
    7:  ("وَإِذَا سَمِعُوا", "واذا سمعوا", "واذا سمعوا"),
    8:  ("وَلَوْ أَنَّنَا", "ولو اننا", "ولو اننا"),
    9:  ("قَالَ الْمَلَأُ", "قال الملأ", "قال الملأ"),
    10: ("وَاعْلَمُوا", "واعلموا", "واعلموا"),
    11: ("يَعْتَذِرُونَ", "یعتذرون", "یعتذرون"),
    12: ("وَمَا مِنْ دَابَّةٍ", "وما من دابة", "وما من دابة"),
    13: ("وَمَا أُبَرِّئُ", "وما ابرئ", "وما ابرئ"),
    14: ("رُبَمَا", "ربما", "ربما"),
    15: ("سُبْحَانَ الَّذِي", "سبحان الذی", "سبحان الذی"),
    16: ("قَالَ أَلَمْ", "قال الم", "قال الم"),
    17: ("اقْتَرَبَ", "اقترب", "اقترب"),
    18: ("قَدْ أَفْلَحَ", "قد افلح", "قد افلح"),
    19: ("وَقَالَ الَّذِينَ", "وقال الذین", "وقال الذین"),
    20: ("أَمَّنْ خَلَقَ", "امن خلق", "امن خلق"),
    21: ("اتْلُ مَا أُوحِيَ", "اتل ما اوحی", "اتل ما اوحی"),
    22: ("وَمَنْ يَقْنُتْ", "ومن یقنت", "ومن یقنت"),
    23: ("وَمَا لِيَ", "وما لی", "وما لی"),
    24: ("فَمَنْ أَظْلَمُ", "فمن اظلم", "فمن اظلم"),
    25: ("إِلَيْهِ يُرَدُّ", "الیه یرد", "الیه یرد"),
    26: ("حٰمٓ", "حم", "حم"),
    27: ("قَالَ فَمَا خَطْبُكُمْ", "قال فما خطبکم", "قال فما خطبکم"),
    28: ("قَدْ سَمِعَ اللَّهُ", "قد سمع الله", "قد سمع الله"),
    29: ("تَبَارَكَ الَّذِي", "تبارک الذی", "تبارک الذی"),
    30: ("عَمَّ يَتَسَاءَلُونَ", "عم یتسائلون", "عم یتسائلون"),
}

# ── Insert Juz data ───────────────────────────────────────────────
try:
    rows_to_insert = [
        (num, ss, sv, es, ev, *JUZ_NAMES[num])
        for num, ss, sv, es, ev in JUZ_DATA
    ]

    conn.executemany(
        """INSERT OR REPLACE INTO juz 
           (number, start_surah, start_verse, end_surah, end_verse,
            name_arabic, name_pashto, name_dari)
           VALUES (?,?,?,?,?,?,?,?)""",
        rows_to_insert
    )
    conn.commit()
    print(f"✅ Inserted {len(rows_to_insert)} rows into juz")

except Exception as e:
    print(f"❌ ERROR inserting Juz: {e}")
    conn.rollback()
    conn.close()
    exit(1)

# ── Verify insert ─────────────────────────────────────────────────
count = conn.execute("SELECT COUNT(*) FROM juz").fetchone()[0]
print(f"📊 Total Juz rows in DB: {count}")

r = conn.execute("SELECT * FROM juz WHERE number = 30").fetchone()
if r:
    print(f"✅ Juz 30: starts {r[1]}:{r[2]}, ends {r[3]}:{r[4]}, name: {r[5]}")
else:
    print("❌ Juz 30 not found!")

conn.close()
print("🎉 Done!")