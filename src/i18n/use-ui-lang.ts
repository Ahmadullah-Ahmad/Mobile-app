import { useCallback, useEffect, useState } from "react";

import { loadSetting, peekSetting, saveSetting } from "@/lib/settings";
import { interpolate, toArabicNumeral } from "@/lib/utils";

import { getDeviceDefaultLang, isRtlLang, type UiLang } from "./config";
import { MESSAGES, type TranslationKey } from "./messages";

export function useUiLang() {
  // With a warm settings cache the language is known on the first render.
  const [lang, setLangState] = useState<UiLang | null>(() => {
    const cached = peekSetting<UiLang>("uiLang");
    if (cached === undefined) return null;
    return cached ?? getDeviceDefaultLang();
  });

  useEffect(() => {
    if (lang !== null) return;
    loadSetting<UiLang>("uiLang").then((saved) => {
      setLangState(saved ?? getDeviceDefaultLang());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolvedLang = lang ?? getDeviceDefaultLang();
  const isRTL = isRtlLang(resolvedLang);

  const setLang = useCallback((next: UiLang) => {
    setLangState(next);
    saveSetting("uiLang", next);
  }, []);

  const formatNumber = useCallback(
    (n: number) => (isRTL ? toArabicNumeral(n) : String(n)),
    [isRTL]
  );

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      const template = MESSAGES[resolvedLang][key];
      return params ? interpolate(template, params, formatNumber) : template;
    },
    [resolvedLang, formatNumber]
  );

  return {
    lang: resolvedLang,
    setLang,
    t,
    formatNumber,
    isRTL,
    isLoaded: lang !== null,
  };
}
