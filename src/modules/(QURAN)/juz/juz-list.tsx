import { useCallback } from "react";
import { FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { useDirection } from "@/hooks/use-direction";
import { usePalette } from "@/hooks/use-palette";
import { navigate, ROUTES } from "@/lib/routes";
import ScreenHeading from "@/UI/screen-heading";
import ScreenTransition from "@/UI/screen-transition";
import TranslationTabs from "@/UI/translation-tabs";

import { useContinueReading } from "../home/home-hooks";
import type { Juz } from "./juz-config";
import { useGetAllJuz } from "./juz-hooks";
import JuzRow from "./juz-row";

export default function JuzList() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useSharedUiLang();
  const { writingDirection } = useDirection();
  const { juzList } = useGetAllJuz();
  const { juzNumber: currentJuz } = useContinueReading();

  const openJuz = useCallback((juz: Juz) => navigate(ROUTES.juz(juz.number)), []);

  return (
    <ScreenTransition
      style={{
        flex: 1,
        backgroundColor: palette.ground,
        paddingTop: insets.top + 4,
        direction: writingDirection,
      }}
    >
      <View style={{ paddingHorizontal: 22, paddingBottom: 14 }}>
        <ScreenHeading title={t("juzListTitle")} subtitle={t("juzListSubtitle")} />
        <TranslationTabs style={{ marginTop: 10 }} />
      </View>

      <FlatList
        data={juzList}
        keyExtractor={(juz) => String(juz.number)}
        renderItem={({ item }) => (
          <JuzRow juz={item} active={item.number === currentJuz} onPress={openJuz} />
        )}
        contentContainerStyle={{ paddingTop: 4, paddingHorizontal: 22, paddingBottom: 16, gap: 8 }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
      />
    </ScreenTransition>
  );
}
