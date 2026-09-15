import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { useDirection } from "@/hooks/use-direction";
import { usePalette } from "@/hooks/use-palette";

import AppText from "./app-text";

interface BookPageFrameProps {
  startLabel: string;
  title: string;
  subtitle: string;
  endLabel: string;
  children: ReactNode;
}

export default function BookPageFrame({
  startLabel,
  title,
  subtitle,
  endLabel,
  children,
}: BookPageFrameProps) {
  const palette = usePalette();
  const { writingDirection } = useDirection();

  return (
    <View style={[styles.page, { backgroundColor: palette.panel, direction: writingDirection }]}>
      <View style={styles.header}>
        <AppText size={12.5} color={palette.ink2} align="start" style={styles.side}>
          {startLabel}
        </AppText>
        <View style={styles.center}>
          <AppText variant="quran" size={18} lineHeight={1.8} align="center">
            {title}
          </AppText>
          <AppText size={8} color={palette.ink2} align="center">
            {subtitle}
          </AppText>
        </View>
        <AppText size={12.5} color={palette.ink2} align="end" style={styles.side}>
          {endLabel}
        </AppText>
      </View>
      <View style={[styles.rule, { backgroundColor: palette.edge }]} />

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, borderRadius: 10, overflow: "hidden" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  side: { flex: 1 },
  center: { alignItems: "center" },
  rule: { height: 1, marginHorizontal: 20 },
  body: { flex: 1 },
  content: { paddingTop: 14, paddingHorizontal: 20, paddingBottom: 18 },
});
