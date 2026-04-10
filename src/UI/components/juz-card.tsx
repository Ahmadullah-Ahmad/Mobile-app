import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import { useIconColors } from "@/hooks/use-icon-colors";
import { useDirection, useSharedUiLang } from "@/lib/i18n-provider";

import { Badge } from "@/components/ui/badge";
import type { Juz } from "../api/types";

interface JuzCardProps {
  juz: Juz;
  onPress: (juz: Juz) => void;
}

/** One row in the juz (para) list. */
export default function JuzCard({ juz, onPress }: JuzCardProps) {
  const { muted } = useIconColors();
  const { chevronForward, isRTL } = useDirection();
  const { t } = useSharedUiLang();

  const badge = (
    <Badge variant={'secondary'}>
      {juz.number}
    </Badge>
  );

  const names = (
    <View className="flex-1 bg-transparent">
      <Text
        style={{ writingDirection: "rtl", textAlign: isRTL ? "right" : "left" }}
        className="text-lg font-semibold text-foreground"
      >
        {juz.name_arabic}
      </Text>
      <Text
        style={{ writingDirection: "rtl", textAlign: isRTL ? "right" : "left" }}
        className="text-sm text-muted-foreground mt-0.5"
      >
        {juz.start_surah_name} ({juz.start_surah}:{juz.start_verse})
      </Text>
    </View>
  );

  const meta = (
    <View className="flex-shrink-0 bg-transparent rounded-sm p-2">
      <Text className="text-xs text-muted-foreground">
        {t("ayat")} {juz.start_verse}–{juz.start_verse}
      </Text>
    </View>
  );

  const chevron = (
    <Ionicons name={chevronForward} size={18} color={muted} />
  );

  return (
    <Pressable
      onPress={() => onPress(juz)}
      className="mx-4 mb-3 flex-row items-center rounded-2xl border border-border bg-card px-4 py-3 gap-x-3 active:opacity-70"
    >
      {isRTL ? (
        <>{chevron}{meta}{names}{badge}</>
      ) : (
        <>{badge}{names}{meta}{chevron}</>
      )}
    </Pressable>
  );
}
