import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { useDirection } from "@/hooks/use-direction";
import { usePalette } from "@/hooks/use-palette";
import { useTranslationLang } from "@/hooks/use-translation-lang";
import { QURAN_TITLE, TRANSLATION_OPTIONS } from "@/lib/constants";
import PrayerHeaderCard from "@/modules/(PRAYER)/prayer-times/prayer-header-card";
import AppText from "@/UI/app-text";
import SegmentedPills from "@/UI/segmented-pills";

import HomeContinueCard from "./home-continue-card";
import { useContinueReading } from "./home-hooks";
import HomeTools from "./home-tools";

export default function HomeView() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useSharedUiLang();
  const { writingDirection } = useDirection();
  const { lang, setLang } = useTranslationLang();
  const reading = useContinueReading();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: palette.ground,
        paddingTop: insets.top,
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 4,
          paddingHorizontal: 22,
          paddingBottom: 22,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ direction: writingDirection }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <SegmentedPills
              options={TRANSLATION_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              }))}
              value={lang}
              onChange={setLang}
            />
            <AppText variant="quran" size={23} lineHeight={2}>
              {QURAN_TITLE}
            </AppText>
          </View>

          <PrayerHeaderCard />
          <HomeTools />

          <HomeContinueCard reading={reading} />
        </View>
      </ScrollView>
    </View>
  );
}
