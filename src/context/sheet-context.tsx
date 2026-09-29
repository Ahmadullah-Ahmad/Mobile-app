import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type SheetName = "bookmarks" | "settings" | "prayerCity";

interface SheetContextValue {
  sheet: SheetName | null;
  openSheet: (name: SheetName) => void;
  closeSheet: () => void;
}

const SheetContext = createContext<SheetContextValue | null>(null);

export function SheetProvider({ children }: { children: ReactNode }) {
  const [sheet, setSheet] = useState<SheetName | null>(null);

  const openSheet = useCallback((name: SheetName) => setSheet(name), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  const value = useMemo(
    () => ({ sheet, openSheet, closeSheet }),
    [sheet, openSheet, closeSheet]
  );

  return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>;
}

export function useAppSheet(): SheetContextValue {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error("useAppSheet must be inside SheetProvider");
  return ctx;
}
