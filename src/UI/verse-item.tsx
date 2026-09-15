import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import type { TranslationLang, Verse } from "@/lib/common-types";
import { ACCENT_COLOR } from "@/lib/constants";
import { cn, toArabicNumeral } from "@/lib/utils";

const SPACING = {
  compact: {
    divider: "mt-3 pt-3 border-t border-border/50",
    pashtoGap: 4,
    dariGap: 2,
  },
  relaxed: {
    divider: "mt-4 pt-4 border-t border-border/40",
    pashtoGap: 6,
    dariGap: 4,
  },
} as const;

interface VerseItemProps {
  verse: Pick<Verse, "verse_number" | "arabic" | "pashto" | "dari">;
  lang: TranslationLang;
  fontSize: number;
  withDivider: boolean;
  spacing?: keyof typeof SPACING;
}

export default function VerseItem({
  verse,
  lang,
  fontSize,
  withDivider,
  spacing = "compact",
}: VerseItemProps) {
  const gaps = SPACING[spacing];
  const arabicSize = fontSize + 6;
  const transSize = fontSize - 2;
  const showPashto = (lang === "pashto" || lang === "both") && Boolean(verse.pashto);
  const showDari = (lang === "dari" || lang === "both") && Boolean(verse.dari);
  const translationStyle = {
    fontSize: transSize,
    lineHeight: transSize * 1.8,
    textAlign: "right",
    writingDirection: "rtl",
  } as const;

  return (
    <View className={cn("bg-transparent", withDivider && gaps.divider)}>
      <Text
        style={{
          fontFamily: "AmiriQuran",
          fontSize: arabicSize,
          lineHeight: arabicSize * 2,
          textAlign: "right",
          writingDirection: "rtl",
        }}
        className="text-foreground"
      >
        {verse.arabic}{" "}
        <Text style={{ color: ACCENT_COLOR }}>
          ﴿{toArabicNumeral(verse.verse_number)}﴾
        </Text>
      </Text>

      {showPashto ? (
        <Text
          style={[translationStyle, { marginTop: gaps.pashtoGap }]}
          className="text-muted-foreground"
        >
          {verse.pashto}
        </Text>
      ) : null}

      {showDari ? (
        <Text
          style={[translationStyle, { marginTop: gaps.dariGap }]}
          className="text-muted-foreground"
        >
          {verse.dari}
        </Text>
      ) : null}
    </View>
  );
}
