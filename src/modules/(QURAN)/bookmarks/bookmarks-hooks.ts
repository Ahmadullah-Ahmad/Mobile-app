import { and, eq } from "drizzle-orm";
import { useMemo } from "react";

import type { DB } from "@/db/client";
import { bookmarks as bookmarksTable } from "@/db/schema";
import { useMutation } from "@/hooks/use-mutation";
import { useQueryVersion } from "@/hooks/use-query-version";
import { useSyncQuery } from "@/hooks/use-sync-query";
import { QUERY_KEYS } from "@/lib/query-keys";

import { bookmarkKey, type Bookmark } from "./bookmarks-config";

const INVALIDATES = [QUERY_KEYS.BOOKMARKS];

const sameVerse = (surahId: number, verseNumber: number) =>
  and(eq(bookmarksTable.surahId, surahId), eq(bookmarksTable.verseNumber, verseNumber));

async function toggleBookmark(
  db: DB,
  surahId: number,
  verseNumber: number,
  note = ""
): Promise<boolean> {
  const existing = await db
    .select({ id: bookmarksTable.id })
    .from(bookmarksTable)
    .where(sameVerse(surahId, verseNumber))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(bookmarksTable).where(sameVerse(surahId, verseNumber));
    return false;
  }
  await db.insert(bookmarksTable).values({ surahId, verseNumber, note });
  return true;
}

async function addBookmark(db: DB, surahId: number, verseNumber: number): Promise<void> {
  await db
    .insert(bookmarksTable)
    .values({ surahId, verseNumber, note: "" })
    .onConflictDoNothing();
}

async function deleteBookmark(db: DB, id: number): Promise<void> {
  await db.delete(bookmarksTable).where(eq(bookmarksTable.id, id));
}

export function useGetAllBookmarks() {
  const version = useQueryVersion(QUERY_KEYS.BOOKMARKS);
  const bookmarks = useSyncQuery(
    "readBookmarks",
    (sqlite) =>
      sqlite.getAllSync<Bookmark>(
        `SELECT b.id, b.surah_id, s.number AS surah_number, s.name_arabic AS surah_name_arabic,
                b.verse_number, v.juz_number,
                COALESCE(b.note, '') AS note, COALESCE(b.created_at, '') AS created_at
         FROM bookmarks b
         JOIN surahs s ON s.id = b.surah_id
         LEFT JOIN verses v ON v.surah_id = b.surah_id AND v.verse_number = b.verse_number
         ORDER BY b.created_at DESC, b.id DESC`
      ),
    [version]
  );
  return { bookmarks };
}

export function useBookmarkedVerses(): Set<string> {
  const { bookmarks } = useGetAllBookmarks();
  return useMemo(
    () => new Set(bookmarks.map((b) => bookmarkKey(b.surah_id, b.verse_number))),
    [bookmarks]
  );
}

export function useToggleBookmark() {
  const { mutate, isPending } = useMutation(toggleBookmark, INVALIDATES);
  return { toggleEntry: mutate, isToggling: isPending };
}

export function useAddBookmark() {
  const { mutate, isPending } = useMutation(addBookmark, INVALIDATES);
  return { addEntry: mutate, isPending };
}

export function useDeleteBookmark() {
  const { mutate, isPending } = useMutation(deleteBookmark, INVALIDATES);
  return { deleteEntry: mutate, isDeleting: isPending };
}
