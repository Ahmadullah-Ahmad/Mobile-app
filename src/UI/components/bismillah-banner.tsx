import Text from "@/components/ui/text";
import View from "@/components/ui/view";

import type { TranslationLang, Verse } from "../api/types";
import { BISMILLAH_TEXT } from "../lib/constants";

interface BismillahBannerProps {
  /**
   * Optional verse-0 row from the DB. When provided, its Arabic + Pashto
   * fields are rendered; otherwise the canonical Arabic-only fallback shows.
   */
  verse?: Verse;
  /** Used to decide whether to show the Pashto/Dari translation. */
  lang?: TranslationLang;
}

/**
 * Reusable Bismillah card shown at the start of every surah (except At-Tawba).
 */
export default function BismillahBanner({
  verse,
  lang = "none",
}: BismillahBannerProps) {
  const arabic = verse?.arabic ?? BISMILLAH_TEXT;
  const showPashto =
    (lang === "pashto" || lang === "both") && Boolean(verse?.pashto);

  return (
    <View className="mx-4 mt-4 mb-2 rounded-2xl bg-primary/5 border border-primary/20 px-4 py-4">
      <Text
        style={{
          fontFamily: "AmiriQuran",
          fontSize: 24,
          lineHeight: 58,
          textAlign: "center",
          writingDirection: "rtl",
        }}
      >
        {arabic}
      </Text>
      {showPashto ? (
        <Text
          style={{
            fontSize: 14,
            lineHeight: 26,
            textAlign: "right",
            writingDirection: "rtl",
          }}
          className="text-muted-foreground mt-2"
        >
          {verse!.pashto}
        </Text>
      ) : null}
    </View>
  );
}
