import { useEffect, useState, useCallback } from "react";
import { loadSetting, saveSetting } from "./settings";

export type UiLang = "pashto" | "dari" | "english";

export const UI_LANG_LABELS: Record<UiLang, string> = {
  pashto: "پښتو",
  dari: "دری",
  english: "English",
};

type Strings = {
  appTitle: string;
  appSubtitle: string;
  continueReading: string;
  continueReadingSub: string;
  pashtoTitle: string;
  pashtoSub: string;
  dariTitle: string;
  dariSub: string;
  arabicTitle: string;
  arabicSub: string;
  settings: string;
  settingsSub: string;
  uiLanguage: string;
  uiLanguageSub: string;
  fontSize: string;
  fontSizeSub: string;
  back: string;
  preview: string;
};

const TABLE: Record<UiLang, Strings> = {
  pashto: {
    appTitle: "القرآن الكريم",
    appSubtitle: "د پښتو او دری ژباړې سره",
    continueReading: "ادامه لوستل",
    continueReadingSub: "Continue Reading",
    pashtoTitle: "پښتو",
    pashtoSub: "پښتو ژباړه",
    dariTitle: "دری",
    dariSub: "دری ژباړه",
    arabicTitle: "عربي",
    arabicSub: "یوازې عربي",
    settings: "تنظیمات",
    settingsSub: "ژبه او د لیک اندازه",
    uiLanguage: "د اپلیکیشن ژبه",
    uiLanguageSub: "د کارن انٹرفیس ژبه وټاکئ",
    fontSize: "د لیک اندازه",
    fontSizeSub: "د آیتونو د متن اندازه",
    back: "شاته",
    preview: "نمونه",
  },
  dari: {
    appTitle: "القرآن الكريم",
    appSubtitle: "همراه با ترجمه پشتو و دری",
    continueReading: "ادامه خواندن",
    continueReadingSub: "Continue Reading",
    pashtoTitle: "پښتو",
    pashtoSub: "ترجمه پشتو",
    dariTitle: "دری",
    dariSub: "ترجمه دری",
    arabicTitle: "عربی",
    arabicSub: "فقط عربی",
    settings: "تنظیمات",
    settingsSub: "زبان و اندازه فونت",
    uiLanguage: "زبان برنامه",
    uiLanguageSub: "زبان رابط کاربری را انتخاب کنید",
    fontSize: "اندازه فونت",
    fontSizeSub: "اندازه متن آیات",
    back: "بازگشت",
    preview: "نمونه",
  },
  english: {
    appTitle: "The Holy Quran",
    appSubtitle: "With Pashto and Dari translation",
    continueReading: "Continue Reading",
    continueReadingSub: "Resume where you left off",
    pashtoTitle: "Pashto",
    pashtoSub: "Pashto translation",
    dariTitle: "Dari",
    dariSub: "Dari translation",
    arabicTitle: "Arabic",
    arabicSub: "Arabic only",
    settings: "Settings",
    settingsSub: "Language and font size",
    uiLanguage: "App Language",
    uiLanguageSub: "Choose interface language",
    fontSize: "Font Size",
    fontSizeSub: "Verse text size",
    back: "Back",
    preview: "Preview",
  },
};

export function useUiLang() {
  const [lang, setLangState] = useState<UiLang>("pashto");

  useEffect(() => {
    loadSetting<UiLang>("uiLang").then((saved) => {
      if (saved) setLangState(saved);
    });
  }, []);

  const setLang = useCallback((next: UiLang) => {
    setLangState(next);
    saveSetting("uiLang", next);
  }, []);

  const t = useCallback((key: keyof Strings) => TABLE[lang][key], [lang]);

  return { lang, setLang, t };
}
