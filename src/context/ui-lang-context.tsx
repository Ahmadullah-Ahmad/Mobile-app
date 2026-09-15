import { createContext, useContext, type ReactNode } from "react";

import { useUiLang } from "@/i18n/use-ui-lang";

type UiLangContextValue = ReturnType<typeof useUiLang>;

const UiLangContext = createContext<UiLangContextValue | null>(null);

export function UiLangProvider({ children }: { children: ReactNode }) {
  const value = useUiLang();
  if (!value.isLoaded) return null;
  return (
    <UiLangContext.Provider value={value}>{children}</UiLangContext.Provider>
  );
}

export function useSharedUiLang(): UiLangContextValue {
  const ctx = useContext(UiLangContext);
  if (!ctx) throw new Error("useSharedUiLang must be inside UiLangProvider");
  return ctx;
}
