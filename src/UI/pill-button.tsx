import { Pressable, View } from "react-native";

import { usePalette } from "@/hooks/use-palette";

import AppText from "./app-text";
import Icon, { type IconName } from "./icon";

const SIZES = {
  md: { paddingVertical: 10, paddingHorizontal: 20, fontSize: 15, iconSize: 16, gap: 7, minHeight: 0, marginVertical: 0 },
  sm: { paddingVertical: 8, paddingHorizontal: 15, fontSize: 13.5, iconSize: 15, gap: 6, minHeight: 44, marginVertical: -2.5 },
} as const;

interface PillButtonProps {
  label: string;
  icon?: IconName;
  iconPosition?: "start" | "end";
  size?: keyof typeof SIZES;
  onPress?: () => void;
}

export default function PillButton({
  label,
  icon,
  iconPosition = "start",
  size = "md",
  onPress,
}: PillButtonProps) {
  const palette = usePalette();
  const s = SIZES[size];
  const iconNode = icon ? (
    <Icon name={icon} size={s.iconSize} color={palette.onAccent} />
  ) : null;

  const content = (
    <>
      {iconPosition === "start" && iconNode}
      <AppText size={s.fontSize} color={palette.onAccent}>
        {label}
      </AppText>
      {iconPosition === "end" && iconNode}
    </>
  );

  const style = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    alignSelf: "flex-start" as const,
    gap: s.gap,
    backgroundColor: palette.accent,
    borderRadius: 999,
    paddingVertical: s.paddingVertical,
    paddingHorizontal: s.paddingHorizontal,
    minHeight: s.minHeight,
    marginVertical: s.marginVertical,
  };

  if (!onPress) return <View style={style}>{content}</View>;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="active:opacity-80"
      style={style}
    >
      {content}
    </Pressable>
  );
}
