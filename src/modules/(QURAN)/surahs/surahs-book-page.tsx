import { memo } from "react";
import { Pressable, Share } from "react-native";

import View from "@/components/ui/view";
import { useSharedUiLang } from "@/context/ui-lang-context";
import type { TranslationLang, Verse } from "@/lib/common-types";
import { formatVerseRange, formatVersesForShare } from "@/lib/utils";
import BismillahBanner from "@/UI/bismillah-banner";
import BookPageFrame from "@/UI/book-page-frame";
import VerseItem from "@/UI/verse-item";

interface SurahsBookPageProps {
  verses: Verse[];
  bismillah?: Verse;
  surahName: string;
  surahNumber: number;
  lang: TranslationLang;
  fontSize: number;
  pageIndex: number;
  totalPages: number;
}

function SurahsBookPage({
  verses,
  bismillah,
  surahName,
  surahNumber,
  lang,
  fontSize,
  pageIndex,
  totalPages,
}: SurahsBookPageProps) {
  const { t } = useSharedUiLang();

  const sharePage = () =>
    Share.share({
      message: `${formatVersesForShare(verses)}\n\n— ${surahName} (${surahNumber})`,
    });

  return (
    <BookPageFrame
      title={surahName}
      meta={`${t("ayat")} ${formatVerseRange(verses)}`}
      pageIndex={pageIndex}
      totalPages={totalPages}
    >
      {pageIndex === 0 && bismillah ? (
        <BismillahBanner verse={bismillah} lang={lang} />
      ) : null}

      <Pressable onLongPress={sharePage}>
        <View className="px-4 pt-2 pb-4 bg-transparent">
          {verses.map((verse, i) => (
            <VerseItem
              key={verse.id}
              verse={verse}
              lang={lang}
              fontSize={fontSize}
              withDivider={i > 0}
            />
          ))}
        </View>
      </Pressable>
    </BookPageFrame>
  );
}

// Memoized so a page swipe does not re-lay out the Arabic of unchanged pages.
export default memo(SurahsBookPage);
