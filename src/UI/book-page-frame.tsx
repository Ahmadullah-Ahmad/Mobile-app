import type { ReactNode } from "react";
import { ScrollView, StyleSheet } from "react-native";

import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import { useDirection } from "@/hooks/use-direction";
import { toArabicNumeral } from "@/lib/utils";

interface BookPageFrameProps {
  title: string;
  meta: string;
  pageIndex: number;
  totalPages: number;
  children: ReactNode;
}

export default function BookPageFrame({
  title,
  meta,
  pageIndex,
  totalPages,
  children,
}: BookPageFrameProps) {
  const { writingDirection } = useDirection();

  return (
    <View style={styles.frame}>
      <View style={styles.frameInner}>
        <View style={[styles.header, { direction: writingDirection }]}>
          <Text
            style={{ fontFamily: "AmiriQuran", writingDirection, textAlign: "right" }}
            className="text-foreground text-right mb-2"
          >
            {title}
          </Text>
          <Text style={{ writingDirection: "rtl" }} className="text-muted-foreground">
            {meta}
          </Text>
        </View>
        <View style={styles.rule} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          style={styles.body}
        >
          {children}
        </ScrollView>

        <View style={styles.rule} />
        <View style={styles.footer}>
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

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    margin: 8,
    borderWidth: 1.5,
    borderColor: "rgba(22,101,52,0.55)",
    borderRadius: 10,
    padding: 4,
  },
  frameInner: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(22,101,52,0.35)",
    borderRadius: 6,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  rule: {
    height: 1,
    backgroundColor: "rgba(22,101,52,0.25)",
    marginHorizontal: 10,
  },
  body: { flex: 1 },
  content: { paddingTop: 4, paddingBottom: 24 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 12,
  },
});
