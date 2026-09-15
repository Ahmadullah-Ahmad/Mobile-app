import { NativeModules, Platform } from "react-native";

export type UiLang = "pashto" | "dari" | "english";

export const UI_LANGS: UiLang[] = ["pashto", "dari", "english"];

export const UI_LANG_LABELS: Record<UiLang, string> = {
  pashto: "پښتو",
  dari: "دری",
  english: "English",
};

export const isRtlLang = (lang: UiLang) => lang !== "english";

function getDeviceLocale(): string {
  try {
    if (Platform.OS === "ios") {
      return (
        NativeModules.SettingsManager?.settings?.AppleLocale ??
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ??
        ""
      );
    }
    return NativeModules.I18nManager?.localeIdentifier ?? "";
  } catch {
    return "";
  }
}

export function getDeviceDefaultLang(): UiLang {
  const locale = getDeviceLocale().toLowerCase();
  if (locale.startsWith("ps")) return "pashto";
  if (locale.startsWith("fa") || locale.startsWith("da")) return "dari";
  return "english";
}
