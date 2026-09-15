import type { Ionicons } from "@expo/vector-icons";

import type { TranslationKey } from "@/i18n/messages";
import type { TranslationLang } from "@/lib/common-types";

export type HomeMode = "surah" | "juz";

export interface HomeLangCard {
  lang: Exclude<TranslationLang, "both">;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const homeLangCards = (
  t: (key: TranslationKey) => string
): HomeLangCard[] => [
  { lang: "pashto", title: t("pashtoTitle"), subtitle: t("pashtoSub"), icon: "language-outline" },
  { lang: "dari", title: t("dariTitle"), subtitle: t("dariSub"), icon: "language-outline" },
  { lang: "none", title: t("arabicTitle"), subtitle: t("arabicSub"), icon: "book-outline" },
];
