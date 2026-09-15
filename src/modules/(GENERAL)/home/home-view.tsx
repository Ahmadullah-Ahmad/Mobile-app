import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSharedUiLang } from "@/context/ui-lang-context";
import { navigate, ROUTES } from "@/lib/routes";
import { loadSetting, saveSetting } from "@/lib/settings";
import NavCard from "@/UI/nav-card";

import { homeLangCards, type HomeLangCard, type HomeMode } from "./home-config";

export default function HomeView() {
  const { t } = useSharedUiLang();
  const [lastRoute, setLastRoute] = useState<string | null>(null);
  const [mode, setMode] = useState<HomeMode>("surah");

  useEffect(() => {
    loadSetting<string>("lastReadRoute").then(setLastRoute);
  }, []);

  const pickLang = async (lang: HomeLangCard["lang"]) => {
    await saveSetting("lang", lang);
    navigate(mode === "surah" ? ROUTES.surahs : ROUTES.juzList);
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center pt-8 pb-6">
          <Text
            style={{
              fontFamily: "AmiriQuran",
              writingDirection: "rtl",
              textAlign: "center",
              fontSize: 40,
              lineHeight: 70,
            }}
            className="text-foreground"
          >
            {t("appTitle")}
          </Text>
          <Text className="text-muted-foreground text-center text-base">
            {t("appSubtitle")}
          </Text>
        </View>

        <View className="flex-1 justify-center gap-4">
          {lastRoute ? (
            <NavCard
              highlighted
              icon="bookmark-outline"
              title={t("continueReading")}
              subtitle={t("continueReadingSub")}
              onPress={() => navigate(lastRoute)}
            />
          ) : null}

          <Tabs value={mode} onValueChange={(v) => setMode(v as HomeMode)}>
            <TabsList>
              <TabsTrigger value="surah">{t("surahTab")}</TabsTrigger>
              <TabsTrigger value="juz">{t("juzTab")}</TabsTrigger>
            </TabsList>
          </Tabs>

          {homeLangCards(t).map((card) => (
            <NavCard
              key={card.lang}
              icon={card.icon}
              title={card.title}
              subtitle={card.subtitle}
              onPress={() => pickLang(card.lang)}
            />
          ))}

          <NavCard
            icon="bookmark-outline"
            title={t("bookmarks")}
            subtitle={t("bookmarksSub")}
            onPress={() => navigate(ROUTES.bookmarks)}
          />
          <NavCard
            icon="settings-outline"
            title={t("settings")}
            subtitle={t("settingsSub")}
            onPress={() => navigate(ROUTES.settings)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
