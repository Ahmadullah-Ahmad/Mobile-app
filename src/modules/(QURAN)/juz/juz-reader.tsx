import { useMemo, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useFontSize } from "@/hooks/use-font-size";
import { useLastRead } from "@/hooks/use-last-read";
import { usePalette } from "@/hooks/use-palette";
import { useTranslationLang } from "@/hooks/use-translation-lang";
import { VERSES_PER_PAGE } from "@/lib/constants";
import { chunk } from "@/lib/utils";
import BookPager from "@/UI/book-pager";

import { useBookmarkedVerses, useToggleBookmark } from "../bookmarks/bookmarks-hooks";
import JuzBookPage from "./juz-book-page";
import { useGetAllJuz, useGetJuzVerses } from "./juz-hooks";

export default function JuzReader({ juzNumber }: { juzNumber: number }) {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { lang } = useTranslationLang();
  const { fontSize } = useFontSize();
  const { verses } = useGetJuzVerses(juzNumber);
  const { juzList } = useGetAllJuz();
  const { lastRead, save: saveLastRead } = useLastRead();
  const bookmarked = useBookmarkedVerses();
  const { toggleEntry } = useToggleBookmark();

  const juz = juzList.find((j) => j.number === juzNumber) ?? null;
  const pages = useMemo(() => chunk(verses, VERSES_PER_PAGE), [verses]);

  const [initialPage] = useState(() => {
    if (!lastRead || lastRead.juz_number !== juzNumber) return 0;
    const index = pages.findIndex((page) =>
      page.some(
        (v) => v.surah_id === lastRead.surah_id && v.verse_number === lastRead.verse_number
      )
    );
    return index > 0 ? index : 0;
  });

  if (!juz) return null;

  return (
    <View style={{ flex: 1, backgroundColor: palette.ground, paddingTop: insets.top + 4 }}>
      <BookPager
        pages={pages}
        initialPage={initialPage}
        onPageChange={(_, page) =>
          saveLastRead(page[0].surah_id, page[0].verse_number, juzNumber)
        }
        renderPage={(page) => (
          <JuzBookPage
            verses={page}
            juzNumber={juzNumber}
            lang={lang}
            fontSize={fontSize}
            bookmarked={bookmarked}
            onToggleBookmark={toggleEntry}
          />
        )}
      />
    </View>
  );
}
