import { TranslationLang, useBookmark } from "@/hooks/use-quran";
import { Verse } from "@/lib/quran-db";
import { cn } from "@/lib/utils";
import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import { Pressable } from "react-native";

/** Convert a number to Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) */
function toArabicNumeral(n: number): string {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

interface Props {
  verse: Verse;
  lang: TranslationLang;
  fontSize?: number;
  highlighted?: boolean;
}

export default function VerseCard({
  verse,
  lang,
  fontSize = 14,
  highlighted = false,
}: Props) {
  const { bookmarked, toggle } = useBookmark(verse.surah_id, verse.verse_number);

  const showPashto  = lang === "pashto" || lang === "both";
  const showDari    = lang === "dari"   || lang === "both";
  const isBismillah = verse.verse_number === 0;

  return (
    // Outer card — the only view that intentionally sets a background
    <View
      className={cn(
        "mx-2 mb-3 rounded-2xl border border-border overflow-hidden",
        highlighted ? "border-primary bg-primary/5" : "bg-card"
      )}
    >
      {/* ── Bookmark button ─────────────────────────────────────────────── */}
      {!isBismillah && (
        <View className="bg-transparent flex-row items-center justify-end pb-0">
          <Pressable
            onPress={toggle}
            hitSlop={8}
            className="p-1"
            accessibilityLabel={bookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            <Text className={cn("text-xl", bookmarked ? "text-amber-500" : "text-muted-foreground")}>
              {bookmarked ? "★" : "☆"}
            </Text>
          </Pressable>
        </View>
      )}

      {/* ── Arabic text with inline ayah number ─────────────────────────── */}
      <View className={cn("bg-transparent px-1 pb-1", isBismillah ? "pt-4" : "pt-1")}>
        <Text
          style={{
            fontFamily: "AmiriQuran",
            fontSize: fontSize + 4,
            lineHeight: (fontSize + 4) * 2.2,
            textAlign: "center",
            writingDirection: "rtl",
          }}
        >
          {verse.arabic}
          {!isBismillah && ` ﴿${toArabicNumeral(verse.verse_number)}﴾`}
        </Text>
      </View>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      {(showPashto || showDari) && (
        <View className="h-px bg-border mx-1" />
      )}

      {/* ── Pashto translation ──────────────────────────────────────────── */}
      {showPashto && verse.pashto ? (
        <View className="bg-transparent px-1 py-1">
          {lang === "both" && (
            <Text className="text-xs text-muted-foreground mb-1 font-medium">
              پښتو
            </Text>
          )}
          <Text
            style={{
              fontSize: fontSize - 2,
              lineHeight: (fontSize - 2) * 1.8,
              textAlign: "right",
              writingDirection: "rtl",
            }}
            className="text-muted-foreground"
          >
            {verse.pashto}
          </Text>
        </View>
      ) : showPashto && !verse.pashto ? (
        <View className="bg-transparent px-1 py-1">
          <Text className="text-muted-foreground text-sm text-center italic">
            ژباړه لا اضافه نه ده شوې
          </Text>
        </View>
      ) : null}

      {/* ── Dari translation ────────────────────────────────────────────── */}
      {showDari && verse.dari ? (
        <View className={cn("bg-transparent px-1 py-1", showPashto && "border-t border-border")}>
          {lang === "both" && (
            <Text className="text-xs text-muted-foreground mb-1 font-medium">
              دری
            </Text>
          )}
          <Text
            style={{
              fontSize: fontSize - 2,
              lineHeight: (fontSize - 2) * 1.8,
              textAlign: "right",
              writingDirection: "rtl",
            }}
            className="text-muted-foreground"
          >
            {verse.dari}
          </Text>
        </View>
      ) : showDari && !verse.dari ? (
        <View className={cn("bg-transparent px-1 py-1", showPashto && "border-t border-border")}>
          <Text className="text-muted-foreground text-sm text-center italic">
            ترجمه دری هنوز اضافه نشده
          </Text>
        </View>
      ) : null}
    </View>
  );
}
