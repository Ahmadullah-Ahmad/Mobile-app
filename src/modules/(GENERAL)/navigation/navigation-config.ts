import type { SheetName } from "@/context/sheet-context";
import type { TranslationKey } from "@/i18n/messages";
import { ROUTES } from "@/lib/routes";
import type { IconName } from "@/UI/icon";

export type ScreenTab = "read" | "surahs" | "juz";

type TabItem = { icon: IconName; labelKey: TranslationKey } & (
  | { kind: "screen"; key: ScreenTab; path: string }
  | { kind: "sheet"; key: SheetName }
);

export const TAB_ITEMS: TabItem[] = [
  { kind: "screen", key: "read", path: ROUTES.home, icon: "book", labelKey: "readTab" },
  { kind: "screen", key: "surahs", path: ROUTES.surahs, icon: "list", labelKey: "surahsTitle" },
  { kind: "screen", key: "juz", path: ROUTES.juzList, icon: "juz", labelKey: "juzListTitle" },
  { kind: "sheet", key: "bookmarks", icon: "bookmark", labelKey: "bookmarks" },
  { kind: "sheet", key: "settings", icon: "sun", labelKey: "settings" },
];

export function screenTabFor(pathname: string): ScreenTab {
  if (pathname === ROUTES.surahs) return "surahs";
  if (pathname === ROUTES.juzList) return "juz";
  return "read";
}
