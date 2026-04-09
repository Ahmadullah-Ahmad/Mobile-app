import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import { useIconColors } from "@/hooks/use-icon-colors";
import { useDirection, useUiLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import type { Surah } from "../api/types";

interface SurahCardProps {
  surah: Surah;
  /** Called when the user taps a surah that has content available. */
  onPress: (surah: Surah) => void;
}

/**
 * One row in the surah list. Tappable when verses exist; visually muted and
 * non-interactive when the surah has not yet been parsed into the DB.
 */
export default function SurahCard({ surah, onPress }: SurahCardProps) {
  const hasContent = Boolean(surah.has_content);
  const { muted } = useIconColors();
  const { chevronForward, isRTL } = useDirection();
  const { t } = useUiLang();

  const badge = (
    <Badge variant={'secondary'}>
      {surah.number}
    </Badge>
  );

  const names = (
    <View className="flex-1 bg-transparent">
      <Text
        style={{ writingDirection: "rtl", textAlign: isRTL ? "right" : "left" }}
        className="text-lg font-semibold text-foreground"
      >
        {surah.name_arabic}
      </Text>
      <Text
        style={{ writingDirection: "rtl", textAlign: isRTL ? "right" : "left" }}
        className="text-sm text-muted-foreground mt-0.5"
      >
        {surah.name_pashto}
      </Text>
    </View>
  );

  const meta = (
    <View className="flex-shrink-0 bg-transparent rounded-sm p-2">
      <View
        className={cn(
          "px-2 py-0.5 rounded-full",
          surah.revelation_type === "meccan"
            ? "bg-amber-100 dark:bg-amber-900/30"
            : "bg-blue-100 dark:bg-blue-900/30"
        )}
      >
        <Text
          className={cn(
            "text-xs font-medium",
            surah.revelation_type === "meccan"
              ? "text-amber-700 dark:text-amber-400"
              : "text-blue-700 dark:text-blue-400"
          )}
        >
          {surah.revelation_type === "meccan" ? t("meccan") : t("medinan")}
        </Text>
      </View>
      <Text className="text-xs text-muted-foreground mt-1">
        {surah.total_verses} {t("ayat")}
      </Text>
    </View>
  );

  const chevron = hasContent ? (
    <Ionicons name={chevronForward} size={18} color={muted} />
  ) : null;

  return (
    <Pressable
      onPress={hasContent ? () => onPress(surah) : undefined}
      className={cn(
        "mx-4 mb-3 flex-row items-center rounded-2xl border border-border px-4 py-3 gap-x-3",
        hasContent ? "bg-card active:opacity-70" : "bg-muted/40 opacity-50"
      )}
    >
      {isRTL ? (
        <>{chevron}{meta}{names}{badge}</>
      ) : (
        <>{badge}{names}{meta}{chevron}</>
      )}
    </Pressable>
  );
}
