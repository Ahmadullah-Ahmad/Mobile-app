import type { TranslationLang } from "@/lib/common-types";
import { isTranslationLang } from "@/lib/constants";

import { usePersistedSetting } from "./use-persisted-setting";

export function useTranslationLang() {
  const [lang, setLang] = usePersistedSetting<TranslationLang>(
    "lang",
    "pashto",
    isTranslationLang
  );
  return { lang, setLang };
}
