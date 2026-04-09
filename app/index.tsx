import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDirection, useUiLang } from "@/lib/i18n";
import { loadSetting, saveSetting } from "@/lib/settings";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Lang = "pashto" | "dari" | "none";
type Mode = "surah" | "juz";

export default function HomeScreen() {
  const [lastRoute, setLastRoute] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("surah");
  const { t } = useUiLang();
  const { chevronForward, isRTL, writingDirection } = useDirection();

  useEffect(() => {
    loadSetting<string>("lastReadRoute").then(setLastRoute);
  }, []);

  const pickLang = async (lang: Lang) => {
    await saveSetting("lang", lang);
    if (mode === "surah") {
      (router.push as any)("/quran");
    } else {
      (router.push as any)("/quran/para");
    }
  };

  const langCards: {
    lang: Lang;
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
      { lang: "pashto", title: t("pashtoTitle"), subtitle: t("pashtoSub"), icon: "language-outline" },
      { lang: "dari", title: t("dariTitle"), subtitle: t("dariSub"), icon: "language-outline" },
      { lang: "none", title: t("arabicTitle"), subtitle: t("arabicSub"), icon: "book-outline" },
    ];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* App title — top center */}
        <View className="items-center pt-8 pb-6">
          <Text
            style={{ fontFamily: "AmiriQuran", writingDirection: "rtl", textAlign: "center", fontSize: 40, lineHeight: 70 }}
            className="text-foreground"
          >
            {t("appTitle")}
          </Text>
          <Text className="text-muted-foreground text-center text-base">
            {t("appSubtitle")}
          </Text>
        </View>

        {/* Navigation buttons — centered vertically in remaining space */}
        <View className="flex-1 justify-center gap-4">
          {/* Continue reading */}
          {lastRoute && (
            <Pressable
              onPress={() => (router.push as any)(lastRoute)}
              className="w-full bg-card rounded-2xl border border-border py-4 px-5 flex-row items-center justify-between active:opacity-80"
            >
              {isRTL && <Ionicons name={chevronForward} size={20} color="gray" />}
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-card-foreground/20 items-center justify-center">
                  <Ionicons name="bookmark-outline" size={20} color="white" />
                </View>
                <View>
                  <Text
                    style={{ writingDirection }}
                    className="text-foreground text-lg font-semibold"
                  >
                    {t("continueReading")}
                  </Text>
                  <Text className="text-foreground/70 text-xs">
                    {t("continueReadingSub")}
                  </Text>
                </View>
              </View>
              {!isRTL && <Ionicons name={chevronForward} size={20} color="gray" />}
            </Pressable>
          )}

          {/* Surah / Juz tabs */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList>
              <TabsTrigger value="surah">{t("surahTab")}</TabsTrigger>
              <TabsTrigger value="juz">{t("juzTab")}</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Language cards — pick a translation, then enter the app */}
          {langCards.map((card) => (
            <Pressable
              key={card.lang}
              onPress={() => pickLang(card.lang)}
              className="w-full bg-card border border-border rounded-2xl py-4 px-5 flex-row items-center justify-between active:opacity-80"
            >
              {isRTL && <Ionicons name={chevronForward} size={20} color="gray" />}
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
                  <Ionicons name={card.icon} size={20} color="gray" />
                </View>
                <View>
                  <Text
                    style={{ writingDirection }}
                    className="text-foreground text-lg font-semibold"
                  >
                    {card.title}
                  </Text>
                  <Text className="text-muted-foreground text-xs">
                    {card.subtitle}
                  </Text>
                </View>
              </View>
              {!isRTL && <Ionicons name={chevronForward} size={20} color="gray" />}
            </Pressable>
          ))}

          {/* Bookmarks card */}
          <Pressable
            onPress={() => (router.push as any)("/quran/bookmarks")}
            className="w-full bg-card border border-border rounded-2xl py-4 px-5 flex-row items-center justify-between active:opacity-80"
          >
            {isRTL && <Ionicons name={chevronForward} size={20} color="gray" />}
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
                <Ionicons name="bookmark-outline" size={20} color="gray" />
              </View>
              <View>
                <Text
                  style={{ writingDirection }}
                  className="text-foreground text-lg font-semibold"
                >
                  {t("bookmarks")}
                </Text>
                <Text className="text-muted-foreground text-xs">
                  {t("bookmarksSub")}
                </Text>
              </View>
            </View>
            {!isRTL && <Ionicons name={chevronForward} size={20} color="gray" />}
          </Pressable>

          {/* Settings card */}
          <Pressable
            onPress={() => (router.push as any)("/settings")}
            className="w-full bg-card border border-border rounded-2xl py-4 px-5 flex-row items-center justify-between active:opacity-80"
          >
            {isRTL && <Ionicons name={chevronForward} size={20} color="gray" />}
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
                <Ionicons name="settings-outline" size={20} color="gray" />
              </View>
              <View>
                <Text
                  style={{ writingDirection }}
                  className="text-foreground text-lg font-semibold"
                >
                  {t("settings")}
                </Text>
                <Text className="text-muted-foreground text-xs">
                  {t("settingsSub")}
                </Text>
              </View>
            </View>
            {!isRTL && <Ionicons name={chevronForward} size={20} color="gray" />}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
