import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import { useFontSize } from "@/lib/font-size";
import { chunk, toArabicNumeral } from "@/lib/utils";
import {
  getAllJuz,
  PageFooter,
  ReaderHeader,
  useDb,
  useJuzVerses,
  useLastRead,
  useTranslationLang,
  type Juz,
  type TranslationLang,
  type Verse,
} from "@/UI";

const SCREEN_W = Dimensions.get("window").width;

// ─── Surah divider (juz-specific — shows between two surahs in one juz) ──────

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
        <Text className="text-xs text-muted-foreground mt-0.5">سوره {number}</Text>
      </View>
      {/* Bismillah — every surah except At-Tawba (9) */}
      {number !== 9 && (
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
  lang,
  fontSize,
  juzNumber,
  pageIndex,
  totalPages,
}: {
  verses: (JuzVerse & { __globalIdx?: number })[];
  surahStarts: Set<number>;
  lang: TranslationLang;
  fontSize: number;
  juzNumber: number;
  pageIndex: number;
  totalPages: number;
}) {
  const showPashto = lang === "pashto" || lang === "both";
  const showDari = lang === "dari" || lang === "both";

  const arabicSize = fontSize + 6;
  const transSize = fontSize - 2;

  // Group consecutive verses by surah so we can insert a divider between
  // surahs and render each surah's Arabic as one inline flowing block.
  const groups: { surah_number: number; surah_name_arabic: string; items: JuzVerse[] }[] = [];
  for (const v of verses) {
    const last = groups[groups.length - 1];
    if (!last || last.surah_number !== v.surah_number) {
      groups.push({
        surah_number: v.surah_number,
        surah_name_arabic: v.surah_name_arabic,
        items: [v],
      });
    } else {
      last.items.push(v);
    }
  }

  const sharePage = async () => {
    const msg = verses
      .map((v) => `${v.arabic} ﴿${toArabicNumeral(v.verse_number)}﴾`)
      .join(" ");
    await Share.share({ message: msg });
  };

  const headerSurah = verses[0]?.surah_name_arabic ?? "";

  return (
    <View style={styles.bookFrame}>
      <View style={styles.bookFrameInner}>
        {/* ── Frame header: current surah + juz number ── */}
        <View style={styles.bookHeader}>
          <Text
            style={{
              fontFamily: "AmiriQuran",
              fontSize: 18,
              writingDirection: "rtl",
              textAlign: "right",
            }}
            className="text-foreground"
          >
            {headerSurah}
          </Text>
          <Text className="text-muted-foreground text-xs">
            پاره {toArabicNumeral(juzNumber)}
          </Text>
        </View>
        <View style={styles.bookHeaderRule} />

        <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.pageContent}
      style={styles.page}
    >
      {groups.map((g, gi) => (
        <View key={`g-${g.surah_number}-${gi}`}>
          {/* Show a surah heading whenever a new surah begins on this page */}
          <SurahDivider name={g.surah_name_arabic} number={g.surah_number} />

          {/* Verse-by-verse body */}
          <Pressable onLongPress={sharePage}>
            <View className="px-3 pt-2 pb-4">
              {g.items.map((v, i) => (
                <View
                  key={`${v.surah_number}-${v.verse_number}`}
                  className={i > 0 ? "mt-4 pt-4 border-t border-border/40" : ""}
                >
                  <Text
                    style={{
                      fontFamily: "AmiriQuran",
                      fontSize: arabicSize,
                      lineHeight: arabicSize * 2,
                      textAlign: "justify",
                      writingDirection: "rtl",
                    }}
                    className="text-foreground"
                  >
                    {v.arabic}
                    {" "}
                    <Text style={{ color: "#16a34a" }}>
                      ﴿{toArabicNumeral(v.verse_number)}﴾
                    </Text>
                  </Text>

                  {showPashto && v.pashto ? (
                    <Text
                      style={{
                        fontSize: transSize,
                        lineHeight: transSize * 1.8,
                        textAlign: "right",
                        writingDirection: "rtl",
                        marginTop: 6,
                      }}
                      className="text-muted-foreground"
                    >
                      {v.pashto}
                    </Text>
                  ) : null}

                  {showDari && v.dari ? (
                    <Text
                      style={{
                        fontSize: transSize,
                        lineHeight: transSize * 1.8,
                        textAlign: "right",
                        writingDirection: "rtl",
                        marginTop: 4,
                      }}
                      className="text-muted-foreground"
                    >
                      {v.dari}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          </Pressable>
        </View>
      ))}
    </ScrollView>

        <View style={styles.bookHeaderRule} />
        <View style={styles.bookFooter}>
          <Text className="text-muted-foreground text-xs">
            {pageIndex + 1} / {totalPages}
          </Text>
          <Text
            style={{ fontFamily: "AmiriQuran", fontSize: 14 }}
            className="text-foreground"
          >
            ﴾ {toArabicNumeral(pageIndex + 1)} ﴿
          </Text>
        </View>
      </View>
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
  const { lang } = useTranslationLang("both");
  const { fontSize } = useFontSize();
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

  const versesPerPage = lang === "none" ? 15 : 10;
  const pages = chunk(taggedVerses, versesPerPage);
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

  if (!juz || loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#166534" />
        <Text className="text-muted-foreground mt-3 text-sm">بارګیرول...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ReaderHeader
          title={juz.name_arabic}
          subtitle={`پاره ${juz.number}`}
        />

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
                fontSize={fontSize}
                juzNumber={juzNumber}
                pageIndex={index}
                totalPages={totalPages}
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
  bookFrame: {
    flex: 1,
    margin: 8,
    borderWidth: 1.5,
    borderColor: "rgba(22,101,52,0.55)",
    borderRadius: 10,
    padding: 4,
  },
  bookFrameInner: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(22,101,52,0.35)",
    borderRadius: 6,
    overflow: "hidden",
  },
  bookHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  bookHeaderRule: {
    height: 1,
    backgroundColor: "rgba(22,101,52,0.25)",
    marginHorizontal: 10,
  },
  bookFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 12,
  },
});
