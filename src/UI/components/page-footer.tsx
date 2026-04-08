import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import { useIconColors } from "@/hooks/use-icon-colors";
import { cn } from "@/lib/utils";

interface PageFooterProps {
  /** Zero-based current page index. */
  current: number;
  /** Total page count. */
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Bottom pagination bar shared by both readers — prev/next buttons plus a
 * progress bar showing how far through the surah/juz the user is.
 */
export default function PageFooter({
  current,
  total,
  onPrev,
  onNext,
}: PageFooterProps) {
  const { foreground } = useIconColors();
  const progress = total > 1 ? (current / (total - 1)) * 100 : 100;
  const atStart = current === 0;
  const atEnd = current === total - 1;

  return (
    <View className="flex-row items-center px-5 py-3 border-t border-border gap-3">
      <Pressable
        onPress={onPrev}
        disabled={atStart}
        hitSlop={8}
        className={cn(
          "w-10 h-10 rounded-full items-center justify-center bg-muted",
          atStart && "opacity-25"
        )}
      >
        <Ionicons name="chevron-back" size={22} color={foreground} />
      </Pressable>

      <View className="flex-1 items-center gap-1">
        <Text className="text-xs text-muted-foreground">
          {current + 1} / {total}
        </Text>
        <View className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <View
            className="h-full bg-primary rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      <Pressable
        onPress={onNext}
        disabled={atEnd}
        hitSlop={8}
        className={cn(
          "w-10 h-10 rounded-full items-center justify-center bg-muted",
          atEnd && "opacity-25"
        )}
      >
        <Ionicons name="chevron-forward" size={22} color={foreground} />
      </Pressable>
    </View>
  );
}
