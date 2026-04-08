import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  DEFAULT_FONT_SIZE,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  useFontSize,
} from "@/lib/font-size";
import { UI_LANG_LABELS, useUiLang, type UiLang } from "@/lib/i18n";

const UI_LANGS: UiLang[] = ["pashto", "dari", "english"];

export default function SettingsScreen() {
  const { lang: uiLang, setLang: setUiLang, t } = useUiLang();
  const { fontSize, increase, decrease } = useFontSize();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-2 pb-4 flex-row items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center active:opacity-80"
        >
          <Ionicons name="chevron-back" size={22} color="gray" />
        </Pressable>
        <Text className="text-foreground text-2xl font-semibold">
          {t("settings")}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
        {/* ── UI Language ───────────────────────────────────────────────── */}
        <View className="gap-2">
          <Text className="text-foreground text-base font-semibold">
            {t("uiLanguage")}
          </Text>
          <Text className="text-muted-foreground text-xs mb-1">
            {t("uiLanguageSub")}
          </Text>
          <View className="bg-card border border-border rounded-2xl overflow-hidden">
            {UI_LANGS.map((l, i) => {
              const selected = uiLang === l;
              return (
                <Pressable
                  key={l}
                  onPress={() => setUiLang(l)}
                  className={`flex-row items-center justify-between px-5 py-4 active:opacity-80 ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <Text className="text-foreground text-base">
                    {UI_LANG_LABELS[l]}
                  </Text>
                  {selected && (
                    <Ionicons name="checkmark" size={20} color="#16a34a" />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Font size ─────────────────────────────────────────────────── */}
        <View className="gap-2">
          <Text className="text-foreground text-base font-semibold">
            {t("fontSize")}
          </Text>
          <Text className="text-muted-foreground text-xs mb-1">
            {t("fontSizeSub")}
          </Text>

          <View className="bg-card border border-border rounded-2xl px-5 py-4 flex-row items-center justify-between">
            <Pressable
              onPress={decrease}
              disabled={fontSize <= MIN_FONT_SIZE}
              className="w-11 h-11 rounded-full bg-muted items-center justify-center active:opacity-70"
              style={{ opacity: fontSize <= MIN_FONT_SIZE ? 0.4 : 1 }}
            >
              <Ionicons name="remove" size={22} color="gray" />
            </Pressable>

            <View className="items-center">
              <Text className="text-foreground text-2xl font-semibold">
                {fontSize}
              </Text>
              <Text className="text-muted-foreground text-xs">
                {MIN_FONT_SIZE}–{MAX_FONT_SIZE}
              </Text>
            </View>

            <Pressable
              onPress={increase}
              disabled={fontSize >= MAX_FONT_SIZE}
              className="w-11 h-11 rounded-full bg-muted items-center justify-center active:opacity-70"
              style={{ opacity: fontSize >= MAX_FONT_SIZE ? 0.4 : 1 }}
            >
              <Ionicons name="add" size={22} color="gray" />
            </Pressable>
          </View>

          {/* Preview */}
          <View className="bg-card border border-border rounded-2xl px-4 py-4 mt-2">
            <Text className="text-muted-foreground text-xs mb-2">
              {t("preview")}
            </Text>
            <Text
              style={{
                fontFamily: "AmiriQuran",
                fontSize: fontSize + 4,
                lineHeight: (fontSize + 4) * 2.2,
                textAlign: "center",
                writingDirection: "rtl",
              }}
              className="text-foreground"
            >
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </Text>
            <Text
              style={{
                fontSize: fontSize - 2,
                lineHeight: (fontSize - 2) * 1.8,
                textAlign: "right",
                writingDirection: "rtl",
              }}
              className="text-muted-foreground mt-2"
            >
              {DEFAULT_FONT_SIZE === fontSize
                ? "د اللهﷻ په نوم چې رحمت یې بې حده او رحم یې تلپاتې دی"
                : "د اللهﷻ په نوم چې رحمت یې بې حده او رحم یې تلپاتې دی"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
