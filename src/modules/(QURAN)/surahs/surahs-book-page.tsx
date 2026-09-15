import { memo, useCallback } from "react";
import { Share } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import type { TranslationLang, Verse } from "@/lib/common-types";
import { showsOpeningBismillah } from "@/lib/constants";
import { formatVerseRange, formatVersesForShare } from "@/lib/utils";
import BismillahBanner from "@/UI/bismillah-banner";
import BookPageFrame from "@/UI/book-page-frame";
import VerseItem from "@/UI/verse-item";

import { bookmarkKey } from "../bookmarks/bookmarks-config";
import type { Surah } from "./surahs-config";

interface SurahsBookPageProps {
  verses: Verse[];
  surah: Surah;
  isFirstPage: boolean;
  lang: TranslationLang;
  fontSize: number;
  bookmarked: Set<string>;
  onToggleBookmark: (surahId: number, verseNumber: number) => void;
}

function SurahsBookPage({
  verses,
  surah,
  isFirstPage,
  lang,
  fontSize,
  bookmarked,
  onToggleBookmark,
}: SurahsBookPageProps) {
  const { t, formatNumber } = useSharedUiLang();

  const sharePage = useCallback(() => {
    Share.share({
      message: `${formatVersesForShare(verses)}\n\n— ${surah.name_arabic} (${surah.number})`,
    });
  }, [verses, surah]);

  return (
    <BookPageFrame
      startLabel={t("juzNumber", { number: verses[0]?.juz_number ?? 1 })}
      title={surah.name_arabic}
      subtitle={t(surah.revelation_type)}
      endLabel={`${t("ayat")} ${formatVerseRange(verses, formatNumber)}`}
    >
      {isFirstPage && showsOpeningBismillah(surah.number) ? <BismillahBanner /> : null}
      {verses.map((verse, index) => (
        <VerseItem
          key={verse.id}
          withDivider={index > 0}
          verse={verse}
          lang={lang}
          fontSize={fontSize}
          bookmarked={bookmarked.has(bookmarkKey(verse.surah_id, verse.verse_number))}
          onToggleBookmark={() => onToggleBookmark(verse.surah_id, verse.verse_number)}
          onLongPress={sharePage}
        />
      ))}
    </BookPageFrame>
  );
}

export default memo(SurahsBookPage);
