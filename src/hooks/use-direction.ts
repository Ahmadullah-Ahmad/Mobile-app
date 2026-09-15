import { useSharedUiLang } from "@/context/ui-lang-context";

/**
 * Direction-aware layout helpers for the current interface language.
 *
 * @param isRTLOverride Forces a direction instead of reading the language.
 */
export function useDirection(isRTLOverride?: boolean) {
  const { isRTL: detected } = useSharedUiLang();
  const isRTL = isRTLOverride ?? detected;

  return {
    isRTL,
    flexRow: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
    textAlign: (isRTL ? "right" : "left") as "right" | "left",
    writingDirection: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
    chevronBack: (isRTL ? "chevron-forward" : "chevron-back") as
      | "chevron-forward"
      | "chevron-back",
    chevronForward: (isRTL ? "chevron-back" : "chevron-forward") as
      | "chevron-back"
      | "chevron-forward",
  };
}
