import type { Ionicons } from "@expo/vector-icons";

import type { TranslationKey } from "@/i18n/messages";

export type ThemeName = "light" | "dark";

export const THEME_OPTIONS: {
  value: ThemeName;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: TranslationKey;
}[] = [
  { value: "light", icon: "sunny-outline", labelKey: "light" },
  { value: "dark", icon: "moon-outline", labelKey: "dark" },
];

export const PREVIEW_ARABIC = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ";
export const PREVIEW_TRANSLATION =
  "د اللهﷻ په نوم چې رحمت یې بې حده او رحم یې تلپاتې دی";
