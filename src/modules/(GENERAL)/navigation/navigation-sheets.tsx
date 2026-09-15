import { useAppSheet } from "@/context/sheet-context";

import BookmarksSheet from "@/modules/(QURAN)/bookmarks/bookmarks-sheet";
import SettingsSheet from "@/modules/(SETTINGS)/settings/settings-sheet";

export default function NavigationSheets() {
  const { sheet, closeSheet } = useAppSheet();

  return (
    <>
      <BookmarksSheet open={sheet === "bookmarks"} onClose={closeSheet} />
      <SettingsSheet open={sheet === "settings"} onClose={closeSheet} />
    </>
  );
}
