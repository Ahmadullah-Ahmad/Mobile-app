import { useMemo, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { useFontSize } from "@/hooks/use-font-size";
import { useLastRead } from "@/hooks/use-last-read";
import { usePalette } from "@/hooks/use-palette";
import { useTranslationLang } from "@/hooks/use-translation-lang";
import { VERSES_PER_PAGE } from "@/lib/constants";
import { chunk } from "@/lib/utils";
import BookPageFrame from "@/UI/book-page-frame";
import BookPager from "@/UI/book-pager";
import EmptyDataComponent from "@/UI/empty-data-component";
import PageEnter from "@/UI/page-enter";

import { useBookmarkedVerses, useToggleBookmark } from "../bookmarks/bookmarks-hooks";
import SurahsBookPage from "./surahs-book-page";
import { useGetSurahWithVerses } from "./surahs-hooks";

interface SurahsReaderProps {
  surahNumber: number;
  initialVerse?: number;
}

export default function SurahsReader({ surahNumber, initialVerse }: SurahsReaderProps) {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useSharedUiLang();
  const { lang } = useTranslationLang();
  const { fontSize } = useFontSize();
  const { lastRead, save: saveLastRead } = useLastRead();
  const { surah, verses } = useGetSurahWithVerses(surahNumber);
  const bookmarked = useBookmarkedVerses();
  const { toggleEntry } = useToggleBookmark();

  const pages = useMemo(
    () => chunk(verses.filter((v) => v.verse_number > 0), VERSES_PER_PAGE),
    [verses]
  );

  const [initialPage] = useState(() => {
    const resumeVerse =
      surah && lastRead && !lastRead.juz_number && lastRead.surah_id === surah.id
        ? lastRead.verse_number
        : undefined;
    const target = initialVerse ?? resumeVerse;
    if (target == null) return 0;
    const index = pages.findIndex((page) => page.some((v) => v.verse_number === target));
    return index > 0 ? index : 0;
  });

  if (!surah) return null;

  return (
    <View style={{ flex: 1, backgroundColor: palette.ground, paddingTop: insets.top + 4 }}>
      <PageEnter style={{ flex: 1 }}>
        {pages.length === 0 ? (
          <View style={{ flex: 1, paddingHorizontal: 14, paddingBottom: 10 }}>
            <BookPageFrame
              startLabel=""
              title={surah.name_arabic}
              subtitle={t(surah.revelation_type)}
              endLabel=""
            >
              <EmptyDataComponent icon="book" title={t("noTranslation")} />
            </BookPageFrame>
          </View>
        ) : (
          <BookPager
            pages={pages}
            initialPage={initialPage}
            onPageChange={(_, page) => saveLastRead(surah.id, page[0].verse_number)}
            renderPage={(page, index) => (
              <SurahsBookPage
                verses={page}
                surah={surah}
                isFirstPage={index === 0}
                lang={lang}
                fontSize={fontSize}
                bookmarked={bookmarked}
                onToggleBookmark={toggleEntry}
              />
            )}
          />
        )}
      </PageEnter>
    </View>
  );
}
