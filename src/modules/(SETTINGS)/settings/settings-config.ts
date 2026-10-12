import type { TranslationKey } from "@/i18n/messages";
import type { IconName } from "@/UI/icon";

export type ThemeName = "light" | "dark";

export const THEME_OPTIONS: { value: ThemeName; icon: IconName; labelKey: TranslationKey }[] = [
  { value: "light", icon: "sun", labelKey: "light" },
  { value: "dark", icon: "moon", labelKey: "dark" },
];

export const ABOUT_CREDITS: { labelKey: TranslationKey; name: string; nameEn: string; email: string }[] = [
  {
    labelKey: "aboutDariTranslation",
    name: "امین الدین «سعیدي – سعید افغاني»‏",
    nameEn: "Aminuddin «Saidi – Said Afghani»",
    email: "saidafghani@hotmail.com",
  },
  {
    labelKey: "aboutPashtoTranslation",
    name: "حامدالله ستون",
    nameEn: "Hamidullah Stoone",
    email: "stoone.af@outlook.com",
  },
];

export const CONTACT_PHONE = "+93729343424";

export const PREVIEW_TRANSLATION = "د اللهﷻ په نوم چې رحمت یې بې حده او رحم یې تلپاتې دی";
