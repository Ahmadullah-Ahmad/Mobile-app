import { View } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { usePalette } from "@/hooks/use-palette";
import { SURAH_PREFIX } from "@/lib/constants";
import AppText from "@/UI/app-text";
import CardRow from "@/UI/card-row";
import Icon from "@/UI/icon";
import IconButton from "@/UI/icon-button";

import type { Bookmark } from "./bookmarks-config";

interface BookmarksRowProps {
  bookmark: Bookmark;
  onOpen: (bookmark: Bookmark) => void;
  onDelete: (id: number) => void;
}

export default function BookmarksRow({ bookmark, onOpen, onDelete }: BookmarksRowProps) {
  const palette = usePalette();
  const { t, formatNumber } = useSharedUiLang();

  return (
    <CardRow
      radius={28}
      paddingVertical={14}
      paddingHorizontal={16}
      gap={13}
      onPress={() => onOpen(bookmark)}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: palette.accentSoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="bookmark" size={18} color={palette.accentStrong} fill={palette.accentStrong} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText variant="amiri" size={18} align="start">
          {`${SURAH_PREFIX} ${bookmark.surah_name_arabic}`}
        </AppText>
        <AppText size={12} color={palette.ink2} align="start" style={{ marginTop: 2 }}>
          {`${t("ayah")} ${formatNumber(bookmark.verse_number)} · ${t("juzNumber", { number: bookmark.juz_number ?? 1 })}`}
        </AppText>
      </View>

      <IconButton
        icon="trash"
        onPress={() => onDelete(bookmark.id)}
        accessibilityLabel={t("delete")}
        color={palette.ink2}
      />
    </CardRow>
  );
}
