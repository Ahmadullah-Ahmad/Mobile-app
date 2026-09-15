import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Drawer } from "@/components/ui/drawer";
import { useSharedUiLang } from "@/context/ui-lang-context";
import { navigate, ROUTES } from "@/lib/routes";
import EmptyDataComponent from "@/UI/empty-data-component";
import LoadingSpinner from "@/UI/loading-spinner";
import ScreenHeader from "@/UI/screen-header";

import type { Surah } from "../surahs/surahs-config";
import type { Bookmark } from "./bookmarks-config";
import BookmarksForm from "./bookmarks-form";
import {
  useDeleteBookmark,
  useGetAllBookmarks,
  useToggleBookmark,
} from "./bookmarks-hooks";
import BookmarksRow from "./bookmarks-row";

export default function BookmarksView() {
  const { t } = useSharedUiLang();
  const { bookmarks, loading, refresh } = useGetAllBookmarks();
  const { toggleEntry } = useToggleBookmark();
  const { deleteEntry } = useDeleteBookmark();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDelete = useCallback(
    async (id: number) => {
      await deleteEntry(id);
      refresh();
    },
    [deleteEntry, refresh]
  );

  const handleAdd = useCallback(
    async (surah: Surah) => {
      await toggleEntry(surah.id, 1);
      refresh();
      setDrawerOpen(false);
    },
    [toggleEntry, refresh]
  );

  const openSurah = useCallback(
    (bookmark: Bookmark) => navigate(ROUTES.surah(bookmark.surah_id)),
    []
  );

  if (loading) return <LoadingSpinner fullScreen label={t("loading")} />;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScreenHeader title={t("bookmarks")} />
      {bookmarks.length === 0 ? (
        <EmptyDataComponent icon="bookmark-outline" title={t("noBookmarks")} />
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(b) => String(b.id)}
          renderItem={({ item }) => (
            <BookmarksRow bookmark={item} onOpen={openSurah} onDelete={handleDelete} />
          )}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable
        onPress={() => setDrawerOpen(true)}
        className="absolute bottom-8 right-6 w-14 h-14 rounded-full bg-secondary items-center justify-center active:opacity-80"
        style={{
          elevation: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        }}
      >
        <Ionicons name="add" size={28} color="#ffff" />
      </Pressable>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={t("addBookmark")}
        size="large"
      >
        <BookmarksForm onSelect={handleAdd} />
      </Drawer>
    </SafeAreaView>
  );
}
