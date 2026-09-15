import type { TranslationKey } from "@/i18n/messages";
import type { IconName } from "@/UI/icon";

export type ThemeName = "light" | "dark";

export const THEME_OPTIONS: { value: ThemeName; icon: IconName; labelKey: TranslationKey }[] = [
  { value: "light", icon: "sun", labelKey: "light" },
  { value: "dark", icon: "moon", labelKey: "dark" },
];

export const PREVIEW_TRANSLATION = "د اللهﷻ په نوم چې رحمت یې بې حده او رحم یې تلپاتې دی";
