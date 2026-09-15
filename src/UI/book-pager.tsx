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
}

export default function BookPager<T>({
  pages,
  initialPage,
  onPageChange,
  renderPage,
}: BookPagerProps<T>) {
  const pagerRef = useRef<ScrollView>(null);
  const currentPageRef = useRef(initialPage);
  const positioned = useRef(initialPage === 0);
  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    const page = pages[initialPage];
    if (page?.length) onPageChange(initialPage, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onContentSizeChange = () => {
    if (positioned.current) return;
    positioned.current = true;
    pagerRef.current?.scrollTo({ x: SCREEN_W * initialPage, animated: false });
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (index === currentPageRef.current) return;
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
      contentOffset={{ x: SCREEN_W * initialPage, y: 0 }}
      onContentSizeChange={onContentSizeChange}
      onMomentumScrollEnd={onMomentumScrollEnd}
      style={styles.pager}
    >
      {pages.map((page, index) => (
        <View key={index} style={styles.slot} className="bg-transparent">
          {Math.abs(index - currentPage) <= RENDER_WINDOW
            ? renderPage(page, index)
            : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pager: { flex: 1 },
  slot: { width: SCREEN_W, flex: 1, paddingHorizontal: 14, paddingBottom: 10 },
});
