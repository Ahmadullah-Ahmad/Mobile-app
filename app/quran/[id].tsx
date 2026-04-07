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
import {
  TranslationLang,
  useLastRead,
  useTranslationLang,
  useVerses,
} from "@/hooks/use-quran";
import type { Verse } from "@/lib/quran-db";
import { getSurah, Surah } from "@/lib/quran-db";
import { useIconColors } from "@/hooks/use-icon-colors";
import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useDb } from "@/lib/db";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Share,

  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const VERSES_PER_PAGE = 5;
const SCREEN_W = Dimensions.get("window").width;

const BISMILLAH_FALLBACK: Verse = {
  id: 0,
  surah_id: 0,
  verse_number: 0,
  arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
  pashto: "د اللهﷻ په نوم چې رحمت یې بې حده او رحم یې تلپاتې دی",
  dari: "به نام خداوند بخشنده مهربان",
};

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

function VerseReaderHeader({
  surah,
  lang,
  onLangChange,
}: {
  surah: Surah;
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
            {surah.name_arabic}
          </Text>
          <Text
            style={{ writingDirection: "rtl" }}
            className="text-xs text-muted-foreground mt-0.5"
          >
            {surah.name_pashto} • {surah.total_verses} آیات
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

// ─── Bismillah ───────────────────────────────────────────────────────────────

function BismillahBanner({ verse, lang }: { verse: Verse; lang: TranslationLang }) {
  return (
    <View className="mx-4 mt-4 mb-2 rounded-2xl bg-primary/5 border border-primary/20 px-4 py-4">
      <Text
        style={{ fontFamily: "AmiriQuran", fontSize: 24, lineHeight: 58, textAlign: "center", writingDirection: "rtl" }}
      >
        {verse.arabic}
      </Text>
      {(lang === "pashto" || lang === "both") && verse.pashto ? (
        <Text
          style={{ fontSize: 14, lineHeight: 26, textAlign: "right", writingDirection: "rtl" }}
          className="text-muted-foreground mt-2"
        >
          {verse.pashto}
        </Text>
      ) : null}
    </View>
  );
}

// ─── Book page ───────────────────────────────────────────────────────────────

function BookPage({
  verses,
  isFirstPage,
  bismillah,
  surahNumber,
  lang,
  surahName,
}: {
  verses: Verse[];
  isFirstPage: boolean;
  bismillah?: Verse;
  surahNumber: number;
  lang: TranslationLang;
  surahName: string;
}) {
  const shareVerse = async (verse: Verse) => {
    const msg = `${verse.arabic}\n\n${verse.pashto}\n\n— ${surahName} (${surahNumber}:${verse.verse_number})`;
    await Share.share({ message: msg });
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.pageContent}
      style={styles.page}
    >
      {isFirstPage && bismillah && surahNumber !== 9 && (
        <BismillahBanner verse={bismillah} lang={lang} />
      )}
      {verses.map((verse) => (
        <Pressable key={verse.id} onLongPress={() => shareVerse(verse)}>
          <VerseCard verse={verse} lang={lang} fontSize={18} />
        </Pressable>
      ))}
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

export default function VerseReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const surahNumber = Number(id);

  const db = useDb();
  const [surah, setSurah] = useState<Surah | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const { lang, setLang } = useTranslationLang("pashto");
  const { save: saveLastRead } = useLastRead();

  const pagerRef = useRef<ScrollView>(null);
  // Tracks current page inside scroll callbacks without stale closure
  const currentPageRef = useRef(0);

  useEffect(() => {
    getSurah(db, surahNumber).then(setSurah);
  }, [db, surahNumber]);

  const { verses, loading } = useVerses(surah?.id ?? 0);
  const { lastRead } = useLastRead();

  const bismillahFromDb = verses.find((v) => v.verse_number === 0);
  const bismillah = surahNumber !== 9
    ? (bismillahFromDb ?? BISMILLAH_FALLBACK)
    : undefined;
  const numbered = verses.filter((v) => v.verse_number > 0);
  const pages = chunk(numbered, VERSES_PER_PAGE);
  const totalPages = pages.length;

  // Restore to saved page when verses load
  useEffect(() => {
    if (!surah || pages.length === 0) return;
    // Only restore if the saved position is for this surah (not a juz read)
    if (lastRead && lastRead.surah_id === surah.id && !lastRead.juz_number) {
      const savedVerse = lastRead.verse_number;
      const pageIdx = pages.findIndex((p) =>
        p.some((v) => v.verse_number === savedVerse)
      );
      if (pageIdx > 0) {
        // Use setTimeout to ensure ScrollView is mounted
        setTimeout(() => {
          pagerRef.current?.scrollTo({ x: SCREEN_W * pageIdx, animated: false });
          currentPageRef.current = pageIdx;
          setCurrentPage(pageIdx);
        }, 100);
      }
    }
    // Save current position on first open
    saveLastRead(surah.id, pages[0]?.[0]?.verse_number ?? 1);
  }, [surah?.id, pages.length]);

  const goToPage = (index: number) => {
    pagerRef.current?.scrollTo({ x: SCREEN_W * index, animated: true });
    currentPageRef.current = index;
    setCurrentPage(index);
    if (pages[index]?.[0] && surah) {
      saveLastRead(surah.id, pages[index][0].verse_number);
    }
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (index !== currentPageRef.current) {
      currentPageRef.current = index;
      setCurrentPage(index);
      if (pages[index]?.[0] && surah) {
        saveLastRead(surah.id, pages[index][0].verse_number);
      }
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!surah || loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#166534" />
        <Text className="text-muted-foreground mt-3 text-sm">بارګیرول...</Text>
      </View>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (numbered.length === 0) {
    return (
      <View className="flex-1">
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          <VerseReaderHeader surah={surah} lang={lang} onLangChange={setLang} />
          {bismillah && <BismillahBanner verse={bismillah} lang={lang} />}
          <View className="flex-1 items-center justify-center px-8 bg-transparent">
            <Text className="text-5xl mb-4">📖</Text>
            <Text
              type="subtitle"
              style={{ writingDirection: "rtl", textAlign: "center" }}
              className="mb-2"
            >
              ژباړه لا اضافه نه ده شوې
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Book reader ────────────────────────────────────────────────────────────
  return (
    <View className="flex-1">
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <VerseReaderHeader surah={surah} lang={lang} onLangChange={setLang} />

        {/* Native paging scroll — each child is exactly one screen wide */}
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
                isFirstPage={index === 0}
                bismillah={bismillah}
                surahNumber={surahNumber}
                lang={lang}
                surahName={surah.name_arabic}
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
