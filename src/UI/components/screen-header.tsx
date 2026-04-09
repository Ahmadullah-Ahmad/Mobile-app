import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable } from "react-native";

import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import { useIconColors } from "@/hooks/use-icon-colors";
import { useDirection } from "@/lib/i18n";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional right-side slot (e.g. language picker, action button). */
  right?: ReactNode;
  /** Hide the back button (e.g. for root tabs). */
  hideBack?: boolean;
  onBack?: () => void;
}

/**
 * Canonical top header used across list and reader screens.
 * Layout: [back] [centered title/subtitle] [right slot]
 */
export default function ScreenHeader({
  title,
  subtitle,
  right,
  hideBack = false,
  onBack,
}: ScreenHeaderProps) {
  const { foreground } = useIconColors();
  const { flexRow, writingDirection, chevronBack } = useDirection();

  return (
    <View className="border-b border-border bg-background">
      <View style={{ flexDirection: flexRow }} className="items-center justify-between px-4 pt-3 pb-3">
        {hideBack ? (
          <View className="w-9 h-9" />
        ) : (
          <Pressable
            onPress={() => (onBack ? onBack() : router.back())}
            hitSlop={8}
            className="w-9 h-9 items-center justify-center rounded-full bg-muted"
          >
            <Ionicons name={chevronBack} size={22} color={foreground} />
          </Pressable>
        )}

        <View className="items-center flex-1 mx-2">
          <Text style={{ writingDirection, textAlign: "center" }} className="text-xl font-bold">
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{ writingDirection, textAlign: "center" }}
              className="text-xs text-muted-foreground mt-0.5"
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {right ?? <View className="w-9 h-9" />}
      </View>
    </View>
  );
}
