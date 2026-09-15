import { useLocalSearchParams } from "expo-router";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
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
import { useDirection, useSharedUiLang } from "@/lib/i18n-provider";
import { chunk, toArabicNumeral } from "@/lib/utils";
import {
  BismillahBanner,
  ReaderHeader,
  useLastRead,
  useSurahReader,
  useTranslationLang,
  type Verse,
} from "@/UI";

const SCREEN_W = Dimensions.get("window").width;

/** Pages this far either side of the current one are kept mounted. */
const RENDER_WINDOW = 1;

const BISMILLAH_FALLBACK: Verse = {
  id: 0,
  surah_id: 0,
  verse_number: 0,
  arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
  pashto: "د اللهﷻ په نوم چې رحمت یې بې حده او رحم یې تلپاتې دی",
  dari: "به نام خداوند بخشنده مهربان",
  juz_number: null,
};

// ─── Book page ───────────────────────────────────────────────────────────────

function BookPageImpl({
  verses,
  isFirstPage,
  bismillah,
  surahNumber,
  lang,
  surahName,
  fontSize,
  pageIndex,
  totalPages,
}: {
  verses: Verse[];
  isFirstPage: boolean;
  bismillah?: Verse;
  surahNumber: number;
  lang: ReturnType<typeof useTranslationLang>["lang"];
  surahName: string;
  fontSize: number;
  pageIndex: number;
  totalPages: number;
}) {
  const sharePage = async () => {
    const msg = verses
      .map((v) => `${v.arabic} ﴿${toArabicNumeral(v.verse_number)}﴾`)
      .join(" ");
    await Share.share({
      message: `${msg}\n\n— ${surahName} (${surahNumber})`,
    });
  };

  const showPashto = lang === "pashto" || lang === "both";
  const showDari = lang === "dari" || lang === "both";
  const arabicSize = fontSize + 6;
  const transSize = fontSize - 2;
  const { t } = useSharedUiLang();
  const { writingDirection } = useDirection()
  const firstVerse = verses[0]?.verse_number;
  const lastVerse = verses[verses.length - 1]?.verse_number;
  const verseRange =
    firstVerse && lastVerse
      ? firstVerse === lastVerse
        ? toArabicNumeral(firstVerse)
        : `${toArabicNumeral(firstVerse)}–${toArabicNumeral(lastVerse)}`
      : "";

  return (
    <View style={styles.bookFrame}>
      <View style={styles.bookFrameInner}>
        {/* ── Frame header: surah name + ayah range ── */}
        <View style={[styles.bookHeader, { direction: writingDirection }]}>
          <Text
            style={{
              fontFamily: "AmiriQuran",
              writingDirection,
              textAlign: "right",
            }}
            className="text-foreground text-right mb-2"
          >
            {surahName}
          </Text>
          <Text style={{ writingDirection: "rtl" }} className="text-muted-foreground ">
            {t("ayat")} {verseRange}
          </Text>
        </View>
        <View style={styles.bookHeaderRule} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.pageContent}
          style={styles.page}
        >
          {isFirstPage && bismillah && surahNumber !== 9 && (
            <BismillahBanner verse={bismillah} lang={lang} />
          )}

          <Pressable onLongPress={sharePage}>
            <View className="px-4 pt-2 pb-4 bg-transparent">
              {verses.map((v, i) => (
                <View
                  key={v.id}
                  className={i > 0 ? "mt-3 pt-3 border-t border-border/50 bg-transparent" : "bg-transparent"}
                >
                  <Text
                    style={{
                      fontFamily: "AmiriQuran",
                      fontSize: arabicSize,
                      lineHeight: arabicSize * 2,
                      textAlign: "right",
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
                        marginTop: 4,
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
                        marginTop: 2,
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
        </ScrollView>

        {/* ── Page footer: page X / Y ── */}
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

/**
 * Memoized so a re-render of the screen (a page swipe, saving the reading
 * position) does not re-lay out the Arabic text of pages whose props are
 * unchanged. Every prop is a primitive or a reference kept stable by useMemo.
 */
const BookPage = memo(BookPageImpl);

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function VerseReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const surahNumber = Number(id);
  const { flexRow, writingDirection } = useDirection();
  const { t } = useSharedUiLang();
  // Every value below is available synchronously, so the first render is the
  // final one — nothing arrives late and forces the pages to render again.
  const { lang } = useTranslationLang("pashto");
  const { fontSize } = useFontSize();
  const { lastRead, save: saveLastRead } = useLastRead();
  const { surah, verses } = useSurahReader(surahNumber);

  const bismillah = useMemo(
    () =>
      surahNumber === 9
        ? undefined
        : (verses.find((v) => v.verse_number === 0) ?? BISMILLAH_FALLBACK),
    [verses, surahNumber]
  );
  // 10 ayahs per page when a translation is visible, 15 when Arabic-only.
  const versesPerPage = lang === "none" ? 15 : 10;
  // Memoized so each page keeps the same `verses` array between renders,
  // which is what lets the memoized BookPage skip re-rendering.
  const pages = useMemo(
    () => chunk(verses.filter((v) => v.verse_number > 0), versesPerPage),
    [verses, versesPerPage]
  );
  const totalPages = pages.length;

  // The page to open on, worked out once from the saved position. Starting the
  // pager there avoids rendering page 1 and then jumping to the saved page.
  const [initialPage] = useState(() => {
    if (!surah || !lastRead || lastRead.juz_number) return 0;
    if (lastRead.surah_id !== surah.id) return 0;
    const idx = pages.findIndex((p) =>
      p.some((v) => v.verse_number === lastRead.verse_number)
    );
    return idx > 0 ? idx : 0;
  });

  const pagerRef = useRef<ScrollView>(null);
  const currentPageRef = useRef(initialPage);
  const positioned = useRef(initialPage === 0);
  // Only pages within RENDER_WINDOW of this one are built. Every slot keeps its
  // full SCREEN_W width, so scroll offsets, snapping and the book feel are
  // unchanged — a far-off page is simply empty until you swipe towards it.
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Record the page actually opened. This used to save page 1's first verse
  // even after restoring a later page, so closing without swiping lost the
  // reading position.
  useEffect(() => {
    const first = pages[initialPage]?.[0];
    if (surah && first) saveLastRead(surah.id, first.verse_number);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surah?.id]);

  // Position the pager on the opening page as soon as its content is laid out.
  const onContentSizeChange = () => {
    if (positioned.current) return;
    positioned.current = true;
    pagerRef.current?.scrollTo({ x: SCREEN_W * initialPage, animated: false });
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

  // ── Unknown surah number in the route ──────────────────────────────────────
  if (!surah) return null;

  // ── Empty (only when surah genuinely has no verses in DB) ─────────────────
  if (pages.length === 0) {
    return (
      <View className="flex-1">
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          <ReaderHeader
            title={surah.name_arabic}
            subtitle={`${surah.name_pashto} • ${surah.total_verses} ${t("ayat")}`}
          />
          {bismillah && <BismillahBanner verse={bismillah} lang={lang} />}
          <View className="flex-1 items-center justify-center px-8 bg-transparent">
            <Text className="text-5xl mb-4">📖</Text>
            <Text
              type="subtitle"
              style={{ writingDirection, textAlign: "center" }}
              className="mb-2"
            >
              {t("noTranslation")}
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
        <ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentOffset={{ x: SCREEN_W * initialPage, y: 0 }}
          onContentSizeChange={onContentSizeChange}
          onMomentumScrollEnd={onMomentumScrollEnd}
          style={styles.pager}
        >
          {pages.map((pageVerses, index) => (
            <View key={index} style={styles.pageSlot} className="bg-transparent">
              {Math.abs(index - currentPage) <= RENDER_WINDOW ? (
                <BookPage
                  verses={pageVerses}
                  isFirstPage={index === 0}
                  bismillah={bismillah}
                  surahNumber={surahNumber}
                  lang={lang}
                  surahName={surah.name_arabic}
                  fontSize={fontSize}
                  pageIndex={index}
                  totalPages={totalPages}
                />
              ) : null}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pager: { flex: 1 },
  pageSlot: { width: SCREEN_W, flex: 1 },
  page: { flex: 1 },
  pageContent: { paddingTop: 4, paddingBottom: 24 },
  // Decorative double border around each book page.
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
