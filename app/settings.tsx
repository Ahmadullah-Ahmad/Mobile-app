import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import {
  DEFAULT_FONT_SIZE,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  useFontSize,
} from "@/lib/font-size";
import { UI_LANG_LABELS, useDirection, useUiLang, type UiLang } from "@/lib/i18n";
import { useTheme } from "@/theme";

const UI_LANGS: UiLang[] = ["pashto", "dari", "english"];

export default function SettingsScreen() {
  const { lang: uiLang, setLang: setUiLang, t, isRTL } = useUiLang();
  const { flexRow, chevronBack } = useDirection(isRTL);
  const { fontSize, increase, decrease } = useFontSize();
  const { theme, setTheme } = useTheme();
  const [langOpen, setLangOpen] = useState(false);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* Header */}
      <View style={{ flexDirection: flexRow }} className="px-5 pt-2 pb-4 items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center active:opacity-80"
        >
          <Ionicons name={chevronBack} size={22} color="gray" />
        </Pressable>
        <Text className="text-foreground text-2xl font-semibold">
          {t("settings")}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
        {/* ── UI Language (dropdown) ────────────────────────────────────── */}
        <View className="gap-2">
          <Text className="text-foreground text-base font-semibold">
            {t("uiLanguage")}
          </Text>
          <Text className="text-muted-foreground text-xs mb-1">
            {t("uiLanguageSub")}
          </Text>
          <Dropdown open={langOpen} onOpenChange={setLangOpen}>
            <DropdownTrigger>
              <View className="bg-card border border-border rounded-2xl px-5 py-4 flex-row items-center justify-between">
                <Text className="text-foreground text-base">
                  {UI_LANG_LABELS[uiLang]}
                </Text>
                <Ionicons name="chevron-down" size={18} color="gray" />
              </View>
            </DropdownTrigger>
            <DropdownContent align="center">
              {UI_LANGS.map((l) => (
                <DropdownItem
                  key={l}
                  icon="language-outline"
                  onSelect={() => setUiLang(l)}
                  shortcut={uiLang === l ? "✓" : undefined}
                >
                  {UI_LANG_LABELS[l]}
                </DropdownItem>
              ))}
            </DropdownContent>
          </Dropdown>
        </View>

        {/* ── Theme toggle ──────────────────────────────────────────────── */}
        <View className="gap-2">
          <Text className="text-foreground text-base font-semibold">
            {t("theme")}
          </Text>
          <Text className="text-muted-foreground text-xs mb-1">
            {t("themeSub")}
          </Text>
          <View className="bg-card border border-border rounded-2xl flex-row overflow-hidden">
            <Pressable
              onPress={() => setTheme("light")}
              className={`flex-1 flex-row items-center justify-center gap-2 py-4 ${
                theme === "light" ? "bg-primary/10" : ""
              }`}
            >
              <Ionicons
                name="sunny-outline"
                size={20}
                color={theme === "light" ? "#16a34a" : "gray"}
              />
              <Text
                className={
                  theme === "light"
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                }
              >
                {t("light")}
              </Text>
            </Pressable>
            <View className="w-px bg-border" />
            <Pressable
              onPress={() => setTheme("dark")}
              className={`flex-1 flex-row items-center justify-center gap-2 py-4 ${
                theme === "dark" ? "bg-primary/10" : ""
              }`}
            >
              <Ionicons
                name="moon-outline"
                size={20}
                color={theme === "dark" ? "#16a34a" : "gray"}
              />
              <Text
                className={
                  theme === "dark"
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                }
              >
                {t("dark")}
              </Text>
            </Pressable>
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
