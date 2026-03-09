import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6 gap-6">
        {/* App title */}
        <View className="items-center gap-2">
          <Text style={{ fontSize: 64 }} className="text-center">📖</Text>
          <Text
            style={{ writingDirection: "rtl", textAlign: "center", fontSize: 32 }}
            className="font-bold text-foreground"
          >
            القرآن الكريم
          </Text>
          <Text className="text-muted-foreground text-center text-base">
            د پښتو او دری ژباړې سره
          </Text>
        </View>

        {/* Open Quran button */}
        <Pressable
          onPress={() => router.push("/quran" as never)}
          className="w-full bg-primary rounded-2xl py-4 items-center active:opacity-80"
        >
          <Text className="text-primary-foreground text-lg font-semibold">
            قرآن خلاص کړئ
          </Text>
          <Text className="text-primary-foreground/70 text-sm mt-0.5">
            Open Quran
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}