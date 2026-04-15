import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Drawer } from "@/components/ui/drawer";
import { useIconColors } from "@/hooks/use-icon-colors";
import { useDirection, useSharedUiLang } from "@/lib/i18n-provider";
import { useTheme } from "@/theme";
import {
  deleteBookmark,
  ScreenHeader,
  toggleBookmark,
  useBookmarks,
  useDb,
  useSurahs,
  type Bookmark,
  type Surah,
} from "@/UI";

export default function BookmarksScreen() {
  const { t } = useSharedUiLang();
  const { isRTL, } = useDirection();
  const { bookmarks, loading, refresh } = useBookmarks();
  const { foreground } = useIconColors()
  const db = useDb();
  const { theme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDelete = useCallback(
    async (id: number) => {
      await deleteBookmark(db, id);
      refresh();
    },
    [db, refresh]
  );

  const handleAdd = useCallback(
    async (surah: Surah) => {
      await toggleBookmark(db, surah.id, 1);
      refresh();
      setDrawerOpen(false);
    },
    [db, refresh]
  );

  const openSurah = (b: Bookmark) => {
    (router.push as any)(`/quran/${b.surah_id}`);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-3 text-sm">{t("loading")}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScreenHeader title={t("bookmarks")} />
      {bookmarks.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="bookmark-outline" size={48} color={theme === "light" ? "black" : "gray"} />
          <Text className="text-muted-foreground text-base mt-4 text-center">
            {t("noBookmarks")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(b) => String(b.id)}
          renderItem={({ item }) => (
            <BookmarkRow
              bookmark={item}
              onOpen={openSurah}
              onDelete={handleDelete}
              isRTL={isRTL}
              t={t}
            />
          )}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB — open add-bookmark drawer */}
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
        <Ionicons name="add" size={28} color={'#ffff'} />
      </Pressable>
      {/* Add bookmark drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={t("addBookmark")}
        size="large"
      >
        <AddBookmarkForm onSelect={handleAdd} isRTL={isRTL} t={t} />
      </Drawer>
    </SafeAreaView>
  );
}

// ─── Add bookmark form (surah list inside the drawer) ────────────────────────

function AddBookmarkForm({
  onSelect,
  isRTL,
  t,
}: {
  onSelect: (s: Surah) => void;
  isRTL: boolean;
  t: (key: any) => string;
}) {
  const { surahs, loading } = useSurahs();

  if (loading) {
    return (
      <View className="items-center py-10">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1">

      <FlatList
        data={surahs}
        keyExtractor={(s) => String(s.id)}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelect(item)}
            className="flex-row items-center px-5 py-3 border-b border-border active:bg-muted/50"
          >
            <View className="w-8 h-8 rounded-full bg-muted items-center justify-center mr-3">
              <Text className=" font-semibold text-foreground">
                {item.number}
              </Text>
            </View>
            <View className="flex-1">
              <Text
                style={{
                  writingDirection: "rtl",
                  textAlign: isRTL ? "right" : "left",
                }}
                className="text-foreground"
              >
                {item.name_arabic}
              </Text>
              <Text
                style={{
                  writingDirection: "rtl",
                  textAlign: isRTL ? "right" : "left",
                }}
                className="text-foreground"
              >
                {item.name_pashto}
              </Text>
            </View>
            <Ionicons name="bookmark-outline" size={20} color="#16a34a" />
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
}

// ─── Bookmark row with context menu ──────────────────────────────────────────

function BookmarkRow({
  bookmark,
  onOpen,
  onDelete,
  isRTL,
  t,
}: {
  bookmark: Bookmark;
  onOpen: (b: Bookmark) => void;
  onDelete: (id: number) => void;
  isRTL: boolean;
  t: (key: any) => string;
}) {
  const [alertOpen, setAlertOpen] = useState(false);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger
          onPress={() => onOpen(bookmark)}
          className="mx-2 mb-3 flex-row items-center rounded-2xl border border-border bg-card px-4 py-3 gap-x-3"
        >
          {isRTL && <Ionicons name="bookmark" size={20} color="#16a34a" />}

          <View className="flex-1">
            <Text
              style={{
                writingDirection: "rtl",
                textAlign: isRTL ? "right" : "left",
              }}
              className="text-foreground text-base font-semibold"
            >
              {t("surahTab")} {bookmark.surah_id} • {t("ayat")}{" "}
              {bookmark.verse_number}
            </Text>
            {bookmark.note ? (
              <Text
                style={{
                  writingDirection: "rtl",
                  textAlign: isRTL ? "right" : "left",
                }}
                className="text-muted-foreground text-sm mt-0.5"
              >
                {bookmark.note}
              </Text>
            ) : null}
            <Text className="text-muted-foreground text-xs mt-1">
              {bookmark.created_at}
            </Text>
          </View>

          {!isRTL && <Ionicons name="bookmark" size={20} color="#16a34a" />}
        </ContextMenuTrigger>

        <ContextMenuContent align={isRTL ? "start" : "end"}>
          <ContextMenuItem icon="book-outline" onSelect={() => onOpen(bookmark)}>
            {t("openSurah")}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            icon="trash-outline"
            destructive
            onSelect={() => setAlertOpen(true)}
          >
            {t("deleteBookmark")}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Delete confirmation alert */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDeleteMsg")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Button variant="outline" onPress={() => setAlertOpen(false)}>
                <Text>{t("cancel")}</Text>
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction>
              <Button
                variant="destructive"
                onPress={() => {
                  setAlertOpen(false);
                  onDelete(bookmark.id);
                }}
              >
                <Text className="text-destructive-foreground">{t("delete")}</Text>
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
