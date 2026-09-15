import { memo, useCallback, useMemo } from "react";
import { Share, View } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import type { TranslationLang } from "@/lib/common-types";
import { formatVerseRange, formatVersesForShare } from "@/lib/utils";
import BookPageFrame from "@/UI/book-page-frame";
import VerseItem from "@/UI/verse-item";

import { bookmarkKey } from "../bookmarks/bookmarks-config";
import type { JuzVerse } from "./juz-config";
import { groupVersesBySurah } from "./juz-filter";
import JuzSurahDivider from "./juz-surah-divider";

interface JuzBookPageProps {
  verses: JuzVerse[];
  juzNumber: number;
  lang: TranslationLang;
  fontSize: number;
  bookmarked: Set<string>;
  onToggleBookmark: (surahId: number, verseNumber: number) => void;
}

function JuzBookPage({
  verses,
  juzNumber,
  lang,
  fontSize,
  bookmarked,
  onToggleBookmark,
}: JuzBookPageProps) {
  const { t, formatNumber } = useSharedUiLang();
  const groups = useMemo(() => groupVersesBySurah(verses), [verses]);
  const first = verses[0];

  const sharePage = useCallback(() => {
    Share.share({ message: formatVersesForShare(verses) });
  }, [verses]);

  return (
    <BookPageFrame
      startLabel={t("juzNumber", { number: juzNumber })}
      title={first?.surah_name_arabic ?? ""}
      subtitle={first ? t(first.surah_revelation_type) : ""}
      endLabel={`${t("ayat")} ${formatVerseRange(verses, formatNumber)}`}
    >
      {groups.map((group, groupIndex) => (
        <View key={`g-${group.surah_number}-${groupIndex}`}>
          {group.items[0].verse_number === 1 ? (
            <JuzSurahDivider name={group.surah_name_arabic} number={group.surah_number} />
          ) : null}
          {group.items.map((verse, index) => (
            <VerseItem
              key={`${verse.surah_id}-${verse.verse_number}`}
              withDivider={index > 0}
              verse={verse}
              lang={lang}
              fontSize={fontSize}
              bookmarked={bookmarked.has(bookmarkKey(verse.surah_id, verse.verse_number))}
              onToggleBookmark={() => onToggleBookmark(verse.surah_id, verse.verse_number)}
              onLongPress={sharePage}
            />
          ))}
        </View>
      ))}
    </BookPageFrame>
  );
}

export default memo(JuzBookPage);
