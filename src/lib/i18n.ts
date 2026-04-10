import { useCallback, useEffect, useState } from "react";
import { NativeModules, Platform } from "react-native";
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
  // Surah / Juz list screens
  surahListTitle: string;
  surahListSubtitle: string;
  juzListTitle: string;
  juzListSubtitle: string;
  search: string;
  loading: string;
  ayat: string;
  meccan: string;
  medinan: string;
  noTranslation: string;
  // Tabs
  surahTab: string;
  juzTab: string;
  // Bookmarks
  bookmarks: string;
  bookmarksSub: string;
  noBookmarks: string;
  deleteBookmark: string;
  openSurah: string;
  addBookmark: string;
  selectSurah: string;
  confirmDelete: string;
  confirmDeleteMsg: string;
  cancel: string;
  delete: string;
  // Theme
  theme: string;
  themeSub: string;
  light: string;
  dark: string;
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
    surahListTitle: "القرآن الكريم",
    surahListSubtitle: "پښتو او دری ژباړه",
    juzListTitle: "پارې",
    juzListSubtitle: "۳۰ پارې",
    search: "لټون...",
    loading: "بارګیرول...",
    ayat: "آیات",
    meccan: "مکي",
    medinan: "مدني",
    noTranslation: "ژباړه لا اضافه نه ده شوې",
    surahTab: "سوره",
    juzTab: "پاره",
    bookmarks: "نښې",
    bookmarksSub: "خوندي شوي آیتونه",
    noBookmarks: "تاسو تر اوسه هیڅ نښه نه ده کړې",
    deleteBookmark: "نښه لرې کړئ",
    openSurah: "سوره خلاصه کړئ",
    addBookmark: "نوې نښه",
    selectSurah: "سوره وټاکئ",
    confirmDelete: "نښه لرې کول",
    confirmDeleteMsg: "ایا تاسو غواړئ دا نښه لرې کړئ؟",
    cancel: "لغوه",
    delete: "لرې کړئ",
    theme: "تم",
    themeSub: "د اپلیکیشن بڼه",
    light: "روښانه",
    dark: "تیاره",
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
    surahListTitle: "القرآن الكريم",
    surahListSubtitle: "ترجمه پشتو و دری",
    juzListTitle: "پاره‌ها",
    juzListSubtitle: "۳۰ پاره",
    search: "جستجو...",
    loading: "بارگذاری...",
    ayat: "آیات",
    meccan: "مکی",
    medinan: "مدنی",
    noTranslation: "ترجمه دری هنوز اضافه نشده",
    surahTab: "سوره",
    juzTab: "پاره",
    bookmarks: "نشانه‌ها",
    bookmarksSub: "آیات ذخیره شده",
    noBookmarks: "هنوز هیچ نشانه‌ای ندارید",
    deleteBookmark: "حذف نشانه",
    openSurah: "باز کردن سوره",
    addBookmark: "نشانه جدید",
    selectSurah: "سوره را انتخاب کنید",
    confirmDelete: "حذف نشانه",
    confirmDeleteMsg: "آیا می‌خواهید این نشانه را حذف کنید؟",
    cancel: "لغو",
    delete: "حذف",
    theme: "تم",
    themeSub: "ظاهر برنامه",
    light: "روشن",
    dark: "تاریک",
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
    surahListTitle: "The Holy Quran",
    surahListSubtitle: "Pashto & Dari translation",
    juzListTitle: "Juz / Para",
    juzListSubtitle: "30 parts",
    search: "Search...",
    loading: "Loading...",
    ayat: "verses",
    meccan: "Meccan",
    medinan: "Medinan",
    noTranslation: "Translation not yet added",
    surahTab: "Surah",
    juzTab: "Juz",
    bookmarks: "Bookmarks",
    bookmarksSub: "Saved verses",
    noBookmarks: "No bookmarks yet",
    deleteBookmark: "Delete bookmark",
    openSurah: "Open surah",
    addBookmark: "Add bookmark",
    selectSurah: "Select surah",
    confirmDelete: "Delete bookmark",
    confirmDeleteMsg: "Are you sure you want to delete this bookmark?",
    cancel: "Cancel",
    delete: "Delete",
    theme: "Theme",
    themeSub: "App appearance",
    light: "Light",
    dark: "Dark",
  },
};

function getDeviceLang(): string {
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

function getDeviceDefault(): UiLang {
  const locale = getDeviceLang().toLowerCase();
  if (locale.startsWith("ps")) return "pashto";
  if (locale.startsWith("fa") || locale.startsWith("da")) return "dari";
  return "english";
}

export function useUiLang() {
  const [lang, setLangState] = useState<UiLang | null>(null);

  useEffect(() => {
    loadSetting<UiLang>("uiLang").then((saved) => {
      setLangState(saved ?? getDeviceDefault());
    });
  }, []);

  const resolvedLang = lang ?? getDeviceDefault();

  const setLang = useCallback((next: UiLang) => {
    setLangState(next);
    saveSetting("uiLang", next);
  }, []);

  const t = useCallback((key: keyof Strings) => TABLE[resolvedLang][key], [resolvedLang]);

  const isRTL = resolvedLang !== "english";
  const isLoaded = lang !== null;

  return { lang: resolvedLang, setLang, t, isRTL, isLoaded };
}

