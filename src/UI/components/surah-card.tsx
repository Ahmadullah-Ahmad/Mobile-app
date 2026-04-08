import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import { useIconColors } from "@/hooks/use-icon-colors";
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

  return (
    <Pressable
      onPress={hasContent ? () => onPress(surah) : undefined}
      className={cn(
        "mx-4 mb-3 flex-row items-center rounded-2xl border border-border px-4 py-3",
        hasContent ? "bg-card active:opacity-70" : "bg-muted/40 opacity-50"
      )}
    >
      {/* Number badge */}
      <Badge variant={'secondary'} >
        {surah.number}
      </Badge>

      {/* Names (LTR container, RTL text) */}
      <View className="flex-1 items-end bg-transparent">
        <Text
          style={{ writingDirection: "rtl", textAlign: "right" }}
          className="text-lg font-semibold text-foreground"
        >
          {surah.name_arabic}
        </Text>
        <Text
          style={{ writingDirection: "rtl", textAlign: "right" }}
          className="text-sm text-muted-foreground mt-0.5"
        >
          {surah.name_pashto}
        </Text>
      </View>

      {/* Meta (verse count + revelation type) */}
      <View className="items-end ml-3 flex-shrink-0 bg-transparent rounded-sm p-2">
        <Text className="text-xs text-muted-foreground">
          {surah.total_verses} آیات
        </Text>
        <View
          className={cn(
            "mt-1 px-2 py-0.5 rounded-full",
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
            {surah.revelation_type === "meccan" ? "مکي" : "مدني"}
          </Text>
        </View>
      </View>

      {hasContent && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={muted}
          style={{ marginLeft: 4 }}
        />
      )}
    </Pressable>
  );
}
