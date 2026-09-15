import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import { BISMILLAH_TEXT, SURAH_WITHOUT_BISMILLAH } from "@/lib/constants";

export default function JuzSurahDivider({
  name,
  number,
}: {
  name: string;
  number: number;
}) {
  return (
    <View className="mx-2 mt-4 mb-2">
      <View className="py-2 px-4 bg-primary/5 border border-primary/20 rounded-xl items-center">
        <Text
          style={{ writingDirection: "rtl", textAlign: "center" }}
          className="text-base font-bold text-foreground"
        >
          {name}
        </Text>
        <Text className="text-xs text-muted-foreground mt-0.5">سوره {number}</Text>
      </View>
      {number !== SURAH_WITHOUT_BISMILLAH && (
        <View className="mt-2 rounded-2xl bg-primary/5 border border-primary/20 px-4 py-3">
          <Text
            style={{
              fontFamily: "AmiriQuran",
              fontSize: 22,
              lineHeight: 52,
              textAlign: "center",
              writingDirection: "rtl",
            }}
          >
            {BISMILLAH_TEXT}
          </Text>
        </View>
      )}
    </View>
  );
}
