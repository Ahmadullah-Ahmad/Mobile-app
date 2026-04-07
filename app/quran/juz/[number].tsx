import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import VerseCard from "@/components/quran/VerseCard";
import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import { useJuzVerses, useLastRead, useTranslationLang, TranslationLang } from "@/hooks/use-quran";
import { useIconColors } from "@/hooks/use-icon-colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useDb } from "@/lib/db";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Share,

  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Juz, Verse } from "@/lib/quran-db";
import { getAllJuz } from "@/lib/quran-db";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const VERSES_PER_PAGE = 5;
const SCREEN_W = Dimensions.get("window").width;

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

// ─── Header ──────────────────────────────────────────────────────────────────

const LANG_LABELS: Record<TranslationLang, string> = {
  pashto: "پښتو",
  dari: "دری",
  both: "دواړه",
  none: "عربي",
};

function JuzReaderHeader({
  juz,
  lang,
  onLangChange,
}: {
  juz: Juz;
  lang: TranslationLang;
  onLangChange: (l: TranslationLang) => void;
}) {
  const { foreground, muted } = useIconColors();
  const [langOpen, setLangOpen] = useState(false);

  return (
    <View className="border-b border-border">
      <View className="flex-row items-center justify-between px-4 pt-3 pb-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="w-9 h-9 items-center justify-center rounded-full bg-muted"
        >
          <Ionicons name="chevron-back" size={22} color={foreground} />
        </Pressable>

        <View className="items-center flex-1 mx-2">
          <Text style={{ writingDirection: "rtl" }} className="text-xl font-bold">
            {juz.name_arabic}
          </Text>
          <Text
            style={{ writingDirection: "rtl" }}
            className="text-xs text-muted-foreground mt-0.5"
          >
            پاره {juz.number}
          </Text>
        </View>

        <Dropdown open={langOpen} onOpenChange={setLangOpen}>
          <DropdownTrigger>
            <View className="flex-row items-center gap-1 bg-muted rounded-full px-3 py-1.5">
              <Text className="text-sm font-medium">{LANG_LABELS[lang]}</Text>
              <Ionicons name="chevron-down" size={14} color={muted} />
            </View>
          </DropdownTrigger>
          <DropdownContent align="end">
            <DropdownItem
              icon="language-outline"
              onSelect={() => onLangChange("pashto")}
              shortcut={lang === "pashto" ? "✓" : undefined}
            >
              پښتو
            </DropdownItem>
            <DropdownItem
              icon="language-outline"
              onSelect={() => onLangChange("dari")}
              shortcut={lang === "dari" ? "✓" : undefined}
            >
              دری
            </DropdownItem>
            <DropdownItem
              icon="layers-outline"
              onSelect={() => onLangChange("both")}
              shortcut={lang === "both" ? "✓" : undefined}
            >
              دواړه
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem
              icon="book-outline"
              onSelect={() => onLangChange("none")}
              shortcut={lang === "none" ? "✓" : undefined}
            >
              یوازې عربي
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </View>
    </View>
  );
}

// ─── Surah divider ───────────────────────────────────────────────────────────

function SurahDivider({ name, number }: { name: string; number: number }) {
  return (
    <View className="mx-2 mt-4 mb-2">
      <View className="py-2 px-4 bg-primary/5 border border-primary/20 rounded-xl items-center">
        <Text
          style={{ writingDirection: "rtl", textAlign: "center" }}
          className="text-base font-bold text-foreground"
        >
          {name}
        </Text>
        <Text className="text-xs text-muted-foreground mt-0.5">
          سوره {number}
        </Text>
      </View>
      {/* Bismillah — every surah except At-Tawba (9) */}
      {number !== 9 && (
        <View className="mt-2 rounded-2xl bg-primary/5 border border-primary/20 px-4 py-3">
          <Text
            style={{ fontFamily: "AmiriQuran", fontSize: 22, lineHeight: 52, textAlign: "center", writingDirection: "rtl" }}
          >
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Book page ───────────────────────────────────────────────────────────────

type JuzVerse = Verse & { surah_number: number; surah_name_arabic: string };

function BookPage({
  verses,
  surahStarts,
  lang,
}: {
  verses: JuzVerse[];
  surahStarts: Set<number>;
  lang: TranslationLang;
}) {
  const shareVerse = async (verse: JuzVerse) => {
    const msg = `${verse.arabic}\n\n— ${verse.surah_name_arabic} (${verse.surah_number}:${verse.verse_number})`;
    await Share.share({ message: msg });
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.pageContent}
      style={styles.page}
    >
      {verses.map((verse, i) => {
        // Find the index in the full list to check surah boundaries
        const globalIdx = (verse as any).__globalIdx as number | undefined;
        const showDivider = globalIdx !== undefined && surahStarts.has(globalIdx);

        return (
          <Pressable key={`${verse.surah_number}-${verse.verse_number}`} onLongPress={() => shareVerse(verse)}>
            {showDivider && (
              <SurahDivider name={verse.surah_name_arabic} number={verse.surah_number} />
            )}
            <VerseCard verse={verse} lang={lang} fontSize={18} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Page footer ─────────────────────────────────────────────────────────────

function PageFooter({
  current,
  total,
  onPrev,
  onNext,
}: {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { foreground } = useIconColors();
  const progress = total > 1 ? (current / (total - 1)) * 100 : 100;

  return (
    <View className="flex-row items-center px-5 py-3 border-t border-border gap-3">
      <Pressable
        onPress={onPrev}
        disabled={current === 0}
        hitSlop={8}
        className={cn(
          "w-10 h-10 rounded-full items-center justify-center bg-muted",
          current === 0 && "opacity-25"
        )}
      >
        <Ionicons name="chevron-back" size={22} color={foreground} />
      </Pressable>

      <View className="flex-1 items-center gap-1">
        <Text className="text-xs text-muted-foreground">
          {current + 1} / {total}
        </Text>
        <View className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <View
            className="h-full bg-primary rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      <Pressable
        onPress={onNext}
        disabled={current === total - 1}
        hitSlop={8}
        className={cn(
          "w-10 h-10 rounded-full items-center justify-center bg-muted",
          current === total - 1 && "opacity-25"
        )}
      >
        <Ionicons name="chevron-forward" size={22} color={foreground} />
      </Pressable>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function JuzReaderScreen() {
  const { number } = useLocalSearchParams<{ number: string }>();
  const juzNumber = Number(number);

  const db = useDb();
  const [juz, setJuz] = useState<Juz | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const { lang, setLang } = useTranslationLang("both");
  const { verses, loading } = useJuzVerses(juzNumber);
  const { lastRead, save: saveLastRead } = useLastRead();

  const pagerRef = useRef<ScrollView>(null);
  const currentPageRef = useRef(0);

  useEffect(() => {
    getAllJuz(db).then((list) => {
      const found = list.find((j) => j.number === juzNumber);
      if (found) setJuz(found);
    });
  }, [db, juzNumber]);

  // Tag each verse with its global index for surah-boundary detection
  const taggedVerses = verses.map((v, i) => ({ ...v, __globalIdx: i }));

  // Pre-compute which global indices start a new surah
  const surahStarts = new Set<number>();
  {
    let prev = -1;
    for (let i = 0; i < verses.length; i++) {
      if (verses[i].surah_number !== prev) {
        surahStarts.add(i);
        prev = verses[i].surah_number;
      }
    }
  }

  const pages = chunk(taggedVerses, VERSES_PER_PAGE);
  const totalPages = pages.length;

  // Restore to saved page when verses load
  useEffect(() => {
    if (pages.length === 0) return;
    if (lastRead && lastRead.juz_number === juzNumber) {
      const savedVerse = lastRead.verse_number;
      const savedSurah = lastRead.surah_id;
      const pageIdx = pages.findIndex((p) =>
        p.some((v) => v.surah_id === savedSurah && v.verse_number === savedVerse)
      );
      if (pageIdx > 0) {
        setTimeout(() => {
          pagerRef.current?.scrollTo({ x: SCREEN_W * pageIdx, animated: false });
          currentPageRef.current = pageIdx;
          setCurrentPage(pageIdx);
        }, 100);
      }
    }
    // Save position on first open
    const first = pages[0]?.[0];
    if (first) saveLastRead(first.surah_id, first.verse_number, juzNumber);
  }, [juzNumber, pages.length]);

  const goToPage = (index: number) => {
    pagerRef.current?.scrollTo({ x: SCREEN_W * index, animated: true });
    currentPageRef.current = index;
    setCurrentPage(index);
    const first = pages[index]?.[0];
    if (first) saveLastRead(first.surah_id, first.verse_number, juzNumber);
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (index !== currentPageRef.current) {
      currentPageRef.current = index;
      setCurrentPage(index);
      const first = pages[index]?.[0];
      if (first) saveLastRead(first.surah_id, first.verse_number, juzNumber);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (!juz || loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#166534" />
        <Text className="text-muted-foreground mt-3 text-sm">بارګیرول...</Text>
      </View>
    );
  }

  // ── Book reader ──────────────────────────────────────────────────────────
  return (
    <View className="flex-1">
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <JuzReaderHeader juz={juz} lang={lang} onLangChange={setLang} />

        <ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          style={styles.pager}
        >
          {pages.map((pageVerses, index) => (
            <View key={index} style={styles.pageSlot} className="bg-transparent">
              <BookPage
                verses={pageVerses}
                surahStarts={surahStarts}
                lang={lang}
              />
            </View>
          ))}
        </ScrollView>

        <PageFooter
          current={currentPage}
          total={totalPages}
          onPrev={() => currentPage > 0 && goToPage(currentPage - 1)}
          onNext={() => currentPage < totalPages - 1 && goToPage(currentPage + 1)}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pager: { flex: 1 },
  pageSlot: { width: SCREEN_W, flex: 1 },
  page: { flex: 1 },
  pageContent: { paddingTop: 4, paddingBottom: 24 },
});
