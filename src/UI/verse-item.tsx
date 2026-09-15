import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { usePalette } from "@/hooks/use-palette";
import type { TranslationLang, Verse } from "@/lib/common-types";
import { toArabicNumeral } from "@/lib/utils";

import AppText from "./app-text";
import Icon from "./icon";

type VerseText = Pick<Verse, "verse_number" | "arabic" | "pashto" | "dari">;

interface VerseItemProps {
  verse: VerseText;
  lang: TranslationLang;
  fontSize: number;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  onLongPress?: () => void;
  withDivider?: boolean;
}

function translationFor(verse: VerseText, lang: TranslationLang): string {
  if (lang === "pashto") return verse.pashto;
  if (lang === "dari") return verse.dari;
  return "";
}

function VerseItem({
  verse,
  lang,
  fontSize,
  bookmarked,
  onToggleBookmark,
  onLongPress,
  withDivider = true,
}: VerseItemProps) {
  const palette = usePalette();
  const { t } = useSharedUiLang();
  const translation = translationFor(verse, lang);

  return (
    <View
      style={{
        paddingVertical: 14,
        borderTopWidth: withDivider ? 1 : 0,
        borderTopColor: palette.edge,
        flexDirection: "row",
        gap: 10,
        alignItems: "flex-start",
        position: "relative"
      }}
    >
      <Pressable
        onPress={onToggleBookmark}
        accessibilityRole="button"
        accessibilityLabel={t("bookmarkVerse")}
        accessibilityState={{ selected: bookmarked }}
        style={{
          width: 20,
          height: 20,
          marginTop: 5,
          marginHorizontal: -15,
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          left: 0,
        }}
      >
        <View
          style={{
            width: 25,
            height: 25,
            borderRadius: 17,
            backgroundColor: bookmarked ? palette.accentSoft : palette.bookmarkOffBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            name="bookmark"
            size={15}
            color={bookmarked ? palette.accentStrong : palette.bookmarkOffInk}
            fill={bookmarked ? palette.accentStrong : "none"}
          />
        </View>
      </Pressable>

      <Pressable onLongPress={onLongPress} style={{ flex: 1, minWidth: 0 }}>
        <AppText variant="quran" size={fontSize + 6} lineHeight={2} align="right">
          {verse.arabic}{" "}
          <Text style={{ color: palette.accent }}>
            ﴿{toArabicNumeral(verse.verse_number)}﴾
          </Text>
        </AppText>
        {translation ? (
          <AppText
            variant="naskh"
            size={fontSize - 2}
            lineHeight={1.8}
            color={palette.ink2}
            align="right"
            style={{ marginTop: 8, writingDirection: "rtl" }}
          >
            {translation}
          </AppText>
        ) : null}
      </Pressable>
    </View>
  );
}

export default memo(VerseItem);
