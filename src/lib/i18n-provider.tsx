import React, { createContext, useContext } from "react";
import { useUiLang, type UiLang } from "./i18n";

interface UiLangContextValue {
  lang: UiLang;
  setLang: (next: UiLang) => void;
  t: (key: any) => string;
  isRTL: boolean;
  isLoaded: boolean;
}

const UiLangContext = createContext<UiLangContextValue | null>(null);

export function UiLangProvider({ children }: { children: React.ReactNode }) {
  const value = useUiLang();
  if (!value.isLoaded) return null;
  return (
    <UiLangContext.Provider value={value}>{children}</UiLangContext.Provider>
  );
}

/**
 * Read language from the shared context. Must be used inside UiLangProvider.
 * This avoids each screen creating its own async load (which causes the flash).
 */
export function useSharedUiLang(): UiLangContextValue {
  const ctx = useContext(UiLangContext);
  if (!ctx) throw new Error("useSharedUiLang must be inside UiLangProvider");
  return ctx;
}

/**
 * Direction-aware layout helpers based on the shared language context.
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
