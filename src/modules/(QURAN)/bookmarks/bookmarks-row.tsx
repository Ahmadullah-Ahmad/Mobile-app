import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, View } from "react-native";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useSharedUiLang } from "@/context/ui-lang-context";
import { useDirection } from "@/hooks/use-direction";
import { ACCENT_COLOR } from "@/lib/constants";
import ConfirmDialog from "@/UI/confirm-dialog";

import type { Bookmark } from "./bookmarks-config";

interface BookmarksRowProps {
  bookmark: Bookmark;
  onOpen: (bookmark: Bookmark) => void;
  onDelete: (id: number) => void;
}

export default function BookmarksRow({
  bookmark,
  onOpen,
  onDelete,
}: BookmarksRowProps) {
  const { t } = useSharedUiLang();
  const { isRTL, textAlign } = useDirection();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const icon = <Ionicons name="bookmark" size={20} color={ACCENT_COLOR} />;

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger
          onPress={() => onOpen(bookmark)}
          className="mx-2 mb-3 flex-row items-center rounded-2xl border border-border bg-card px-4 py-3 gap-x-3"
        >
          {isRTL && icon}

          <View className="flex-1">
            <Text
              style={{ writingDirection: "rtl", textAlign }}
              className="text-foreground text-base font-semibold"
            >
              {t("surahTab")} {bookmark.surah_id} • {t("ayat")}{" "}
              {bookmark.verse_number}
            </Text>
            {bookmark.note ? (
              <Text
                style={{ writingDirection: "rtl", textAlign }}
                className="text-muted-foreground text-sm mt-0.5"
              >
                {bookmark.note}
              </Text>
            ) : null}
            <Text className="text-muted-foreground text-xs mt-1">
              {bookmark.created_at}
            </Text>
          </View>

          {!isRTL && icon}
        </ContextMenuTrigger>

        <ContextMenuContent align={isRTL ? "start" : "end"}>
          <ContextMenuItem icon="book-outline" onSelect={() => onOpen(bookmark)}>
            {t("openSurah")}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            icon="trash-outline"
            destructive
            onSelect={() => setConfirmOpen(true)}
          >
            {t("deleteBookmark")}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("confirmDelete")}
        message={t("confirmDeleteMsg")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        onConfirm={() => onDelete(bookmark.id)}
      />
    </>
  );
}
