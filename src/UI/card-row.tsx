import type { ReactNode } from "react";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";

import { usePalette } from "@/hooks/use-palette";

interface CardRowProps {
  radius: number;
  paddingVertical: number;
  paddingHorizontal: number;
  gap: number;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export default function CardRow({
  radius,
  paddingVertical,
  paddingHorizontal,
  gap,
  onPress,
  accessibilityLabel,
  style,
  children,
}: CardRowProps) {
  const palette = usePalette();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={accessibilityLabel}
      className={onPress ? "active:opacity-80" : undefined}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap,
          backgroundColor: palette.panel,
          borderRadius: radius,
          paddingVertical,
          paddingHorizontal,
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}
