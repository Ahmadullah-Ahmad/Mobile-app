import { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import View from "@/components/ui/view";
import { useFontSize } from "@/hooks/use-font-size";
import { useLastRead } from "@/hooks/use-last-read";
import { useTranslationLang } from "@/hooks/use-translation-lang";
import { versesPerPage } from "@/lib/constants";
import { chunk } from "@/lib/utils";
import BookPager from "@/UI/book-pager";

import JuzBookPage from "./juz-book-page";
import { useGetAllJuz, useGetJuzVerses } from "./juz-hooks";

export default function JuzReader({ juzNumber }: { juzNumber: number }) {
  const { lang } = useTranslationLang("both");
  const { fontSize } = useFontSize();
  const { verses } = useGetJuzVerses(juzNumber);
  const { juzList } = useGetAllJuz();
  const { lastRead, save: saveLastRead } = useLastRead();

  const juz = juzList.find((j) => j.number === juzNumber) ?? null;

  const perPage = versesPerPage(lang);
  const pages = useMemo(() => chunk(verses, perPage), [verses, perPage]);

  // Opening on the saved page avoids rendering page 1 and then jumping.
  const [initialPage] = useState(() => {
    if (!lastRead || lastRead.juz_number !== juzNumber) return 0;
    const idx = pages.findIndex((page) =>
      page.some(
        (v) =>
          v.surah_id === lastRead.surah_id &&
          v.verse_number === lastRead.verse_number
      )
    );
    return idx > 0 ? idx : 0;
  });

  if (!juz) return null;

  return (
    <View className="flex-1">
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <BookPager
          pages={pages}
          initialPage={initialPage}
          onPageChange={(_, page) =>
            saveLastRead(page[0].surah_id, page[0].verse_number, juzNumber)
          }
          renderPage={(page, index) => (
            <JuzBookPage
              verses={page}
              juzNumber={juzNumber}
              lang={lang}
              fontSize={fontSize}
              pageIndex={index}
              totalPages={pages.length}
            />
          )}
        />
      </SafeAreaView>
    </View>
  );
}
