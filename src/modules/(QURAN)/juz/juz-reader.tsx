import { useMemo, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { useFontSize } from "@/hooks/use-font-size";
import { useLastRead } from "@/hooks/use-last-read";
import { usePalette } from "@/hooks/use-palette";
import { useTranslationLang } from "@/hooks/use-translation-lang";
import { VERSES_PER_PAGE } from "@/lib/constants";
import { replace, ROUTES } from "@/lib/routes";
import { chunk } from "@/lib/utils";
import AppText from "@/UI/app-text";
import BookPager from "@/UI/book-pager";
import PageEnter from "@/UI/page-enter";

import { useBookmarkedVerses, useToggleBookmark } from "../bookmarks/bookmarks-hooks";
import JuzBookPage from "./juz-book-page";
import type { Juz } from "./juz-config";
import { useGetAllJuz, useGetJuzVerses } from "./juz-hooks";

interface JuzReaderProps {
  juzNumber: number;
  startAtEnd?: boolean;
}

export default function JuzReader({ juzNumber, startAtEnd = false }: JuzReaderProps) {
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
  const prevJuz = juzList.find((j) => j.number === juzNumber - 1) ?? null;
  const nextJuz = juzList.find((j) => j.number === juzNumber + 1) ?? null;
  const pages = useMemo(() => chunk(verses, VERSES_PER_PAGE), [verses]);

  const [initialPage] = useState(() => {
    if (startAtEnd) return Math.max(pages.length - 1, 0);
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
      <PageEnter style={{ flex: 1 }}>
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
          startSlot={prevJuz ? <JuzEdgeSlot juz={prevJuz} /> : undefined}
          onStartReached={() => prevJuz && replace(ROUTES.juz(prevJuz.number, true))}
          endSlot={nextJuz ? <JuzEdgeSlot juz={nextJuz} /> : undefined}
          onEndReached={() => nextJuz && replace(ROUTES.juz(nextJuz.number))}
        />
      </PageEnter>
    </View>
  );
}

// Shown on the extra page before the first / after the last page, naming the juz it leads to.
function JuzEdgeSlot({ juz }: { juz: Juz }) {
  const palette = usePalette();
  const { t } = useSharedUiLang();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 6 }}>
      <AppText size={14} color={palette.ink2} align="center">
        {t("juzNumber", { number: juz.number })}
      </AppText>
      <AppText variant="quran" size={26} lineHeight={1.9} align="center">
        {juz.name_arabic}
      </AppText>
    </View>
  );
}
