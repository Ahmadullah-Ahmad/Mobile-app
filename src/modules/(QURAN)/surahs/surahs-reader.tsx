import { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import View from "@/components/ui/view";
import { useSharedUiLang } from "@/context/ui-lang-context";
import { useFontSize } from "@/hooks/use-font-size";
import { useLastRead } from "@/hooks/use-last-read";
import { useTranslationLang } from "@/hooks/use-translation-lang";
import { SURAH_WITHOUT_BISMILLAH, versesPerPage } from "@/lib/constants";
import { chunk } from "@/lib/utils";
import BismillahBanner from "@/UI/bismillah-banner";
import BookPager from "@/UI/book-pager";
import EmptyDataComponent from "@/UI/empty-data-component";
import ReaderHeader from "@/UI/reader-header";

import SurahsBookPage from "./surahs-book-page";
import { BISMILLAH_FALLBACK } from "./surahs-config";
import { useGetSurahWithVerses } from "./surahs-hooks";

export default function SurahsReader({ surahNumber }: { surahNumber: number }) {
  const { t } = useSharedUiLang();
  const { lang } = useTranslationLang("pashto");
  const { fontSize } = useFontSize();
  const { lastRead, save: saveLastRead } = useLastRead();
  const { surah, verses } = useGetSurahWithVerses(surahNumber);

  const bismillah = useMemo(
    () =>
      surahNumber === SURAH_WITHOUT_BISMILLAH
        ? undefined
        : (verses.find((v) => v.verse_number === 0) ?? BISMILLAH_FALLBACK),
    [verses, surahNumber]
  );

  const perPage = versesPerPage(lang);
  const pages = useMemo(
    () => chunk(verses.filter((v) => v.verse_number > 0), perPage),
    [verses, perPage]
  );

  // Opening on the saved page avoids rendering page 1 and then jumping.
  const [initialPage] = useState(() => {
    if (!surah || !lastRead || lastRead.juz_number) return 0;
    if (lastRead.surah_id !== surah.id) return 0;
    const idx = pages.findIndex((page) =>
      page.some((v) => v.verse_number === lastRead.verse_number)
    );
    return idx > 0 ? idx : 0;
  });

  if (!surah) return null;

  if (pages.length === 0) {
    return (
      <View className="flex-1">
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          <ReaderHeader
            title={surah.name_arabic}
            subtitle={`${surah.name_pashto} • ${surah.total_verses} ${t("ayat")}`}
          />
          {bismillah && <BismillahBanner verse={bismillah} lang={lang} />}
          <EmptyDataComponent icon="book-outline" title={t("noTranslation")} />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <BookPager
          pages={pages}
          initialPage={initialPage}
          onPageChange={(_, page) => saveLastRead(surah.id, page[0].verse_number)}
          renderPage={(page, index) => (
            <SurahsBookPage
              verses={page}
              bismillah={bismillah}
              surahName={surah.name_arabic}
              surahNumber={surahNumber}
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
