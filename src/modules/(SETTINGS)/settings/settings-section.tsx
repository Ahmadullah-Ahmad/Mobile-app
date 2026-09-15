import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import { usePalette } from "@/hooks/use-palette";
import AppText from "@/UI/app-text";

interface SettingsSectionProps {
  title: string;
  subtitle: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export default function SettingsSection({ title, subtitle, style, children }: SettingsSectionProps) {
  const palette = usePalette();

  return (
    <View style={[{ marginBottom: 24 }, style]}>
      <AppText variant="uiMedium" size={15} align="start" style={{ marginHorizontal: 2, marginBottom: 2 }}>
        {title}
      </AppText>
      <AppText size={12} color={palette.ink2} align="start" style={{ marginHorizontal: 2, marginBottom: 10 }}>
        {subtitle}
      </AppText>
      {children}
    </View>
  );
}
