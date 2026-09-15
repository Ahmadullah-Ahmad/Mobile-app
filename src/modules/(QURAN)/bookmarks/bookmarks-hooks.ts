import { and, desc, eq } from "drizzle-orm";
import { useCallback, useEffect, useState } from "react";

import { useDb, type DB } from "@/db/client";
import { bookmarks } from "@/db/schema";
import { useMutation } from "@/hooks/use-mutation";

import type { Bookmark } from "./bookmarks-config";

const sameVerse = (surahId: number, verseNumber: number) =>
  and(eq(bookmarks.surahId, surahId), eq(bookmarks.verseNumber, verseNumber));

async function getBookmarks(db: DB): Promise<Bookmark[]> {
  const rows = await db
    .select({
      id: bookmarks.id,
      surah_id: bookmarks.surahId,
      verse_number: bookmarks.verseNumber,
      note: bookmarks.note,
      created_at: bookmarks.createdAt,
    })
    .from(bookmarks)
    .orderBy(desc(bookmarks.createdAt));

  return rows.map((r) => ({
    ...r,
    note: r.note ?? "",
    created_at: r.created_at ?? "",
  }));
}

async function isBookmarked(
  db: DB,
  surahId: number,
  verseNumber: number
): Promise<boolean> {
  const rows = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(sameVerse(surahId, verseNumber))
    .limit(1);
  return rows.length > 0;
}

async function toggleBookmark(
  db: DB,
  surahId: number,
  verseNumber: number,
  note = ""
): Promise<boolean> {
  if (await isBookmarked(db, surahId, verseNumber)) {
    await db.delete(bookmarks).where(sameVerse(surahId, verseNumber));
    return false;
  }
  await db.insert(bookmarks).values({ surahId, verseNumber, note });
  return true;
}

async function deleteBookmark(db: DB, id: number): Promise<void> {
  await db.delete(bookmarks).where(eq(bookmarks.id, id));
}

export function useGetAllBookmarks() {
  const db = useDb();
  const [data, setData] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    getBookmarks(db)
      .then(setData)
      .finally(() => setLoading(false));
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { bookmarks: data, loading, refresh };
}

export function useToggleBookmark() {
  const { mutate, isPending } = useMutation(toggleBookmark);
  return { toggleEntry: mutate, isToggling: isPending };
}

export function useDeleteBookmark() {
  const { mutate, isPending } = useMutation(deleteBookmark);
  return { deleteEntry: mutate, isDeleting: isPending };
}

export function useIsBookmarked(surahId: number, verseNumber: number) {
  const db = useDb();
  const [bookmarked, setBookmarked] = useState(false);
  const { toggleEntry } = useToggleBookmark();

  useEffect(() => {
    isBookmarked(db, surahId, verseNumber).then(setBookmarked);
  }, [db, surahId, verseNumber]);

  const toggle = useCallback(async () => {
    const added = await toggleEntry(surahId, verseNumber);
    setBookmarked(added);
    return added;
  }, [toggleEntry, surahId, verseNumber]);

  return { bookmarked, toggle };
}
