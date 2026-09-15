import { Pressable, View } from "react-native";

import { usePalette } from "@/hooks/use-palette";

import AppText from "./app-text";

interface SectionHeaderProps {
  title: string;
  actionLabel: string;
  onAction: () => void;
}

export default function SectionHeader({
  title,
  actionLabel,
  onAction,
}: SectionHeaderProps) {
  const palette = usePalette();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginHorizontal: 2,
        marginBottom: 11,
      }}
    >
      <AppText size={16}>{title}</AppText>
      <Pressable
        onPress={onAction}
        accessibilityRole="link"
        style={{ minHeight: 44, marginVertical: -10, marginHorizontal: -6, paddingHorizontal: 6, justifyContent: "center" }}
      >
        <AppText size={13} color={palette.accentText}>
          {actionLabel}
        </AppText>
      </Pressable>
    </View>
  );
}
