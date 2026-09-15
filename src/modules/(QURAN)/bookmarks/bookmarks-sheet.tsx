import { useCallback, useEffect, useState } from "react";
import { ScrollView } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { usePalette } from "@/hooks/use-palette";
import { FIRST_AYAH } from "@/lib/constants";
import { navigate, ROUTES } from "@/lib/routes";
import ConfirmDialog from "@/UI/confirm-dialog";
import DrawerPanel, { useDrawerBottomSpace } from "@/UI/drawer-panel";
import EmptyDataComponent from "@/UI/empty-data-component";
import IconButton from "@/UI/icon-button";
import PillButton from "@/UI/pill-button";

import type { Surah } from "../surahs/surahs-config";
import type { Bookmark } from "./bookmarks-config";
import { useAddBookmark, useDeleteBookmark, useGetAllBookmarks } from "./bookmarks-hooks";
import BookmarksRow from "./bookmarks-row";
import BookmarksSurahPicker from "./bookmarks-surah-picker";

interface BookmarksSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function BookmarksSheet({ open, onClose }: BookmarksSheetProps) {
  const palette = usePalette();
  const { t } = useSharedUiLang();
  const bottomSpace = useDrawerBottomSpace();
  const { bookmarks } = useGetAllBookmarks();
  const { addEntry } = useAddBookmark();
  const { deleteEntry } = useDeleteBookmark();
  const [picking, setPicking] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setPicking(false);
      setPendingDeleteId(null);
    }
  }, [open]);

  const confirmDelete = useCallback(() => {
    if (pendingDeleteId != null) deleteEntry(pendingDeleteId);
  }, [pendingDeleteId, deleteEntry]);

  const openBookmark = useCallback(
    (bookmark: Bookmark) => {
      onClose();
      navigate(ROUTES.surah(bookmark.surah_number, bookmark.verse_number));
    },
    [onClose]
  );

  const addSurah = useCallback(
    async (surah: Surah) => {
      await addEntry(surah.id, FIRST_AYAH);
      setPicking(false);
    },
    [addEntry]
  );

  if (picking) {
    return (
      <DrawerPanel
        open={open}
        onClose={onClose}
        title={t("selectSurah")}
        subtitle={t("selectSurahSub")}
        action={
          <IconButton
            icon="chevronBack"
            onPress={() => setPicking(false)}
            accessibilityLabel={t("back")}
            backgroundColor={palette.panel}
          />
        }
      >
        <BookmarksSurahPicker onSelect={addSurah} />
      </DrawerPanel>
    );
  }

  return (
    <DrawerPanel
      open={open}
      onClose={onClose}
      title={t("bookmarks")}
      subtitle={t("bookmarksSub")}
      action={
        <PillButton size="sm" icon="plus" label={t("addBookmark")} onPress={() => setPicking(true)} />
      }
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: bottomSpace, gap: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {bookmarks.length === 0 ? (
          <EmptyDataComponent icon="bookmark" title={t("noBookmarks")} />
        ) : (
          bookmarks.map((bookmark) => (
            <BookmarksRow
              key={bookmark.id}
              bookmark={bookmark}
              onOpen={openBookmark}
              onDelete={setPendingDeleteId}
            />
          ))
        )}
      </ScrollView>

      <ConfirmDialog
        open={pendingDeleteId != null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPendingDeleteId(null);
        }}
        title={t("confirmDelete")}
        message={t("confirmDeleteMsg")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        onConfirm={confirmDelete}
      />
    </DrawerPanel>
  );
}
