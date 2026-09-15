import { Text, type TextProps, type TextStyle } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { usePalette } from "@/hooks/use-palette";
import { FONTS } from "@/lib/fonts";

export type TextVariant =
  | "ui"
  | "uiMedium"
  | "naskh"
  | "amiri"
  | "quran"
  | "latin"
  | "heading";

const FIXED_FAMILIES: Record<Exclude<TextVariant, "ui" | "uiMedium">, string> = {
  naskh: FONTS.naskh,
  amiri: FONTS.amiri,
  quran: FONTS.quran,
  latin: FONTS.latin,
  heading: FONTS.heading,
};

// start/end follow the reading direction; left/right are physical sides of the screen.
export type TextAlign = "start" | "end" | "center" | "left" | "right";

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  size: number;
  lineHeight?: number;
  color?: string;
  align?: TextAlign;
}

// Screens set `direction` from the UI language, and React Native swaps left/right
// text alignment inside RTL layouts, so "left" means start there.
function resolveAlign(align: TextAlign | undefined, isRTL: boolean): TextStyle["textAlign"] {
  switch (align) {
    case "start":
      return "left";
    case "end":
      return "right";
    case "left":
      return isRTL ? "right" : "left";
    case "right":
      return isRTL ? "left" : "right";
    default:
      return align;
  }
}

export default function AppText({
  variant = "ui",
  size,
  lineHeight = 1.55,
  color,
  align,
  style,
  ...props
}: AppTextProps) {
  const palette = usePalette();
  const { isRTL } = useSharedUiLang();

  const fontFamily =
    variant === "ui"
      ? isRTL ? FONTS.naskh : FONTS.latin
      : variant === "uiMedium"
        ? isRTL ? FONTS.naskhMedium : FONTS.latin
        : FIXED_FAMILIES[variant];

  return (
    <Text
      {...props}
      style={[
        {
          fontFamily,
          fontSize: size,
          lineHeight: size * lineHeight,
          color: color ?? palette.ink,
          textAlign: resolveAlign(align, isRTL),
          includeFontPadding: false,
        },
        style,
      ]}
    />
  );
}
