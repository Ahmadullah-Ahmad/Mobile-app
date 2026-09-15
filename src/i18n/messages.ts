import type { UiLang } from "./config";
import en from "./locales/en.json";
import fa from "./locales/fa.json";
import ps from "./locales/ps.json";

export type Messages = typeof ps;
export type TranslationKey = keyof Messages;

// Typed against the Pashto file, so a key missing from Dari or English fails type-checking.
export const MESSAGES: Record<UiLang, Messages> = {
  pashto: ps,
  dari: fa,
  english: en,
};
