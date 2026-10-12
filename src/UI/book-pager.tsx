import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import View from "@/components/ui/view";
import { RENDER_WINDOW } from "@/lib/constants";

const SCREEN_W = Dimensions.get("window").width;

interface BookPagerProps<T> {
  pages: T[][];
  initialPage: number;
  onPageChange: (index: number, page: T[]) => void;
  renderPage: (page: T[], index: number) => ReactNode;
  // Extra slots before the first / after the last page; swiping onto one calls its callback (e.g. open the previous / next juz).
  startSlot?: ReactNode;
  onStartReached?: () => void;
  endSlot?: ReactNode;
  onEndReached?: () => void;
}

export default function BookPager<T>({
  pages,
  initialPage,
  onPageChange,
  renderPage,
  startSlot,
  onStartReached,
  endSlot,
  onEndReached,
}: BookPagerProps<T>) {
  const pagerRef = useRef<ScrollView>(null);
  const currentPageRef = useRef(initialPage);
  const offset = startSlot ? 1 : 0;
  const initialX = SCREEN_W * (initialPage + offset);
  const positioned = useRef(initialX === 0);
  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    const page = pages[initialPage];
    if (page?.length) onPageChange(initialPage, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onContentSizeChange = () => {
    if (positioned.current) return;
    positioned.current = true;
    pagerRef.current?.scrollTo({ x: initialX, animated: false });
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W) - offset;
    if (index === currentPageRef.current) return;
    if (startSlot && index === -1) {
      onStartReached?.();
      return;
    }
    if (endSlot && index === pages.length) {
      onEndReached?.();
      return;
    }
    currentPageRef.current = index;
    setCurrentPage(index);
    const page = pages[index];
    if (page?.length) onPageChange(index, page);
  };

  return (
    <ScrollView
      ref={pagerRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      contentOffset={{ x: initialX, y: 0 }}
      onContentSizeChange={onContentSizeChange}
      onMomentumScrollEnd={onMomentumScrollEnd}
      style={styles.pager}
    >
      {startSlot ? (
        <View style={styles.slot} className="bg-transparent">
          {startSlot}
        </View>
      ) : null}
      {pages.map((page, index) => (
        <View key={index} style={styles.slot} className="bg-transparent">
          {Math.abs(index - currentPage) <= RENDER_WINDOW
            ? renderPage(page, index)
            : null}
        </View>
      ))}
      {endSlot ? (
        <View style={styles.slot} className="bg-transparent">
          {endSlot}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pager: { flex: 1 },
  slot: { width: SCREEN_W, flex: 1, paddingHorizontal: 14, paddingBottom: 10 },
});
