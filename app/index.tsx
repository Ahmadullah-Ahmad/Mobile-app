import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { loadSetting } from "@/lib/settings";

export default function HomeScreen() {
  const [lastRoute, setLastRoute] = useState<string | null>(null);

  useEffect(() => {
    loadSetting<string>("lastReadRoute").then(setLastRoute);
  }, []);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="flex-1 px-6">
        {/* App title — top center */}
        <View className="items-center pt-8 pb-6">
          <Text
            style={{ fontFamily: "AmiriQuran", writingDirection: "rtl", textAlign: "center", fontSize: 40, lineHeight: 70 }}
            className="text-foreground"
          >
            القرآن الكريم
          </Text>
          <Text className="text-muted-foreground text-center text-base">
            د پښتو او دری ژباړې سره
          </Text>
        </View>

        {/* Navigation buttons — centered vertically in remaining space */}
        <View className="flex-1 justify-center gap-4">
          {/* Continue reading */}
          {lastRoute && (
            <Pressable
              onPress={() => (router.push as any)(lastRoute)}
              className="w-full bg-primary rounded-2xl py-4 px-5 flex-row items-center justify-between active:opacity-80"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-primary-foreground/20 items-center justify-center">
                  <Ionicons name="bookmark-outline" size={20} color="white" />
                </View>
                <View>
                  <Text
                    style={{ writingDirection: "rtl" }}
                    className="text-primary-foreground text-lg font-semibold"
                  >
                    ادامه لوستل
                  </Text>
                  <Text className="text-primary-foreground/70 text-xs">
                    Continue Reading
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
            </Pressable>
          )}

          {/* Surah button */}
          <Pressable
            onPress={() => (router.push as any)("/quran")}
            className="w-full bg-card border border-border rounded-2xl py-4 px-5 flex-row items-center justify-between active:opacity-80"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-primary-foreground/20 items-center justify-center">
                <Ionicons name="book-outline" size={20} color="gray" />
              </View>
              <View>
                <Text
                  style={{ writingDirection: "rtl" }}
                  className="text-foreground text-lg font-semibold"
                >
                  سوره
                </Text>
                <Text className="text-muted-foreground text-xs">
                  ۱۱۴ سوره
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </Pressable>

          {/* Juz / Para button */}
          <Pressable
            onPress={() => (router.push as any)("/quran/para")}
            className="w-full bg-card border border-border rounded-2xl py-4 px-5 flex-row items-center justify-between active:opacity-80"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
                <Ionicons name="layers-outline" size={20} color="gray" />
              </View>
              <View>
                <Text
                  style={{ writingDirection: "rtl" }}
                  className="text-foreground text-lg font-semibold"
                >
                  پاره
                </Text>
                <Text className="text-muted-foreground text-xs">
                  ۳۰ پاره
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
