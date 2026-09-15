import { useCallback, useEffect, useState } from "react";

import { loadSetting, peekSetting, saveSetting } from "@/lib/settings";

import { getDeviceDefaultLang, isRtlLang, type UiLang } from "./config";
import { MESSAGES, type TranslationKey } from "./messages";

export function useUiLang() {
  // With a warm settings cache the language is known on the first render, so
  // UiLangProvider does not have to render nothing and wait for a file read.
  const [lang, setLangState] = useState<UiLang | null>(() => {
    const cached = peekSetting<UiLang>("uiLang");
    if (cached === undefined) return null; // cache not loaded yet
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

  const setLang = useCallback((next: UiLang) => {
    setLangState(next);
    saveSetting("uiLang", next);
  }, []);

  const t = useCallback(
    (key: TranslationKey) => MESSAGES[resolvedLang][key],
    [resolvedLang]
  );

  return {
    lang: resolvedLang,
    setLang,
    t,
    isRTL: isRtlLang(resolvedLang),
    isLoaded: lang !== null,
  };
}
