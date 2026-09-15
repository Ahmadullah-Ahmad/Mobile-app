import { View, type StyleProp, type ViewStyle } from "react-native";

import AppText from "./app-text";

interface NumberBadgeProps {
  label: string;
  size: number;
  fontSize: number;
  backgroundColor: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export default function NumberBadge({
  label,
  size,
  fontSize,
  backgroundColor,
  color,
  style,
}: NumberBadgeProps) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <AppText variant="amiri" size={fontSize} lineHeight={1.3} color={color}>
        {label}
      </AppText>
    </View>
  );
}
