import { Pressable, type StyleProp, type ViewStyle } from "react-native";

import { usePalette } from "@/hooks/use-palette";

import Icon, { type IconName } from "./icon";

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  iconSize?: number;
  backgroundColor?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export default function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  iconSize = 17,
  backgroundColor = "transparent",
  color,
  style,
}: IconButtonProps) {
  const palette = usePalette();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="active:opacity-70"
      style={[
        {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Icon name={icon} size={iconSize} color={color ?? palette.ink} />
    </Pressable>
  );
}
