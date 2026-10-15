// Afghan/Indo-Pak para boundaries. The data first shipped with Madani boundaries, which differ for
// paras 4, 7, 11, 20, 21 and 23. Safe to run on every open: it only rewrites these rows, and
// bookmarks / last_read are untouched (bookmark juz numbers are joined from verses).
export const JUZ_BOUNDARY_FIX_SQL = `
UPDATE juz SET end_surah = 3,  end_verse = 91  WHERE number = 3;
UPDATE juz SET start_surah = 3,  start_verse = 92 WHERE number = 4;
UPDATE juz SET end_surah = 5,  end_verse = 82  WHERE number = 6;
UPDATE juz SET start_surah = 5,  start_verse = 83 WHERE number = 7;
UPDATE juz SET end_surah = 9,  end_verse = 93  WHERE number = 10;
UPDATE juz SET start_surah = 9,  start_verse = 94 WHERE number = 11;
UPDATE juz SET end_surah = 27, end_verse = 59  WHERE number = 19;
UPDATE juz SET start_surah = 27, start_verse = 60, end_surah = 29, end_verse = 44 WHERE number = 20;
UPDATE juz SET start_surah = 29, start_verse = 45 WHERE number = 21;
UPDATE juz SET end_surah = 36, end_verse = 21  WHERE number = 22;
UPDATE juz SET start_surah = 36, start_verse = 22 WHERE number = 23;

UPDATE verses SET juz_number = 4  WHERE surah_id = 3  AND verse_number = 92;
UPDATE verses SET juz_number = 6  WHERE surah_id = 5  AND verse_number = 82;
UPDATE verses SET juz_number = 10 WHERE surah_id = 9  AND verse_number = 93;
UPDATE verses SET juz_number = 19 WHERE surah_id = 27 AND verse_number BETWEEN 56 AND 59;
UPDATE verses SET juz_number = 21 WHERE surah_id = 29 AND verse_number = 45;
UPDATE verses SET juz_number = 23 WHERE surah_id = 36 AND verse_number BETWEEN 22 AND 27;
`;
