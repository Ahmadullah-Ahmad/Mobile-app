import type { TranslationLang } from "@/lib/common-types";

import { usePersistedSetting } from "./use-persisted-setting";

/**
 * The reader's translation language, saved under "lang".
 *
 * The home screen writes the same key when a language card is picked. The
 * value must be right on the first render: "none" shows 15 verses per page
 * instead of 10, so a late value re-chunks and re-renders every page.
 */
export function useTranslationLang(initial: TranslationLang = "pashto") {
  const [lang, setLang] = usePersistedSetting<TranslationLang>("lang", initial);
  return { lang, setLang };
}
