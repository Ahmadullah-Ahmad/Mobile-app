import { View } from "react-native";

import { usePalette } from "@/hooks/use-palette";

import AppText, { type TextVariant } from "./app-text";

interface ScreenHeadingProps {
  title: string;
  subtitle: string;
  titleVariant?: TextVariant;
  titleLineHeight?: number;
}

export default function ScreenHeading({
  title,
  subtitle,
  titleVariant = "ui",
  titleLineHeight,
}: ScreenHeadingProps) {
  const palette = usePalette();

  return (
    <View style={{ alignItems: "center", marginBottom: 4 }}>
      <AppText variant={titleVariant} size={22} lineHeight={titleLineHeight} align="center">
        {title}
      </AppText>
      <AppText size={12.5} color={palette.ink2} align="center">
        {subtitle}
      </AppText>
    </View>
  );
}
