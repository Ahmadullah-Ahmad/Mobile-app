import { memo, useMemo } from "react";
import { Pressable, Share } from "react-native";

import View from "@/components/ui/view";
import type { TranslationLang } from "@/lib/common-types";
import { formatVersesForShare, toArabicNumeral } from "@/lib/utils";
import BookPageFrame from "@/UI/book-page-frame";
import VerseItem from "@/UI/verse-item";

import type { JuzVerse } from "./juz-config";
import { groupVersesBySurah } from "./juz-filter";
import JuzSurahDivider from "./juz-surah-divider";

interface JuzBookPageProps {
  verses: JuzVerse[];
  juzNumber: number;
  lang: TranslationLang;
  fontSize: number;
  pageIndex: number;
  totalPages: number;
}

function JuzBookPage({
  verses,
  juzNumber,
  lang,
  fontSize,
  pageIndex,
  totalPages,
}: JuzBookPageProps) {
  const groups = useMemo(() => groupVersesBySurah(verses), [verses]);
  const sharePage = () => Share.share({ message: formatVersesForShare(verses) });

  return (
    <BookPageFrame
      title={verses[0]?.surah_name_arabic ?? ""}
      meta={`پاره ${toArabicNumeral(juzNumber)}`}
      pageIndex={pageIndex}
      totalPages={totalPages}
    >
      {groups.map((group, gi) => (
        <View key={`g-${group.surah_number}-${gi}`}>
          {group.items[0].verse_number === 1 && (
            <JuzSurahDivider
              name={group.surah_name_arabic}
              number={group.surah_number}
            />
          )}
          <Pressable onLongPress={sharePage}>
            <View className="px-3 pt-2 pb-4">
              {group.items.map((verse, i) => (
                <VerseItem
                  key={`${verse.surah_number}-${verse.verse_number}`}
                  verse={verse}
                  lang={lang}
                  fontSize={fontSize}
                  withDivider={i > 0}
                  spacing="relaxed"
                />
              ))}
            </View>
          </Pressable>
        </View>
      ))}
    </BookPageFrame>
  );
}

// Memoized so a page swipe does not re-lay out the Arabic of unchanged pages.
export default memo(JuzBookPage);
