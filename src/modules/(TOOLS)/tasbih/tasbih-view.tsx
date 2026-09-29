import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { useDirection } from "@/hooks/use-direction";
import { usePalette } from "@/hooks/use-palette";
import AppText from "@/UI/app-text";
import ConfirmDialog from "@/UI/confirm-dialog";
import IconButton from "@/UI/icon-button";
import ScreenTransition from "@/UI/screen-transition";
import SegmentedPills from "@/UI/segmented-pills";
import ToolHeader from "@/UI/tool-header";

import { DHIKR_LIST, TARGETS, type Target } from "./tasbih-config";
import TasbihCounter from "./tasbih-counter";
import { useTasbih } from "./tasbih-hooks";

export default function TasbihView() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { t, formatNumber } = useSharedUiLang();
  const { writingDirection } = useDirection();
  const { dhikr, count, total, target, increment, reset, selectDhikr, selectTarget } = useTasbih();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <ScreenTransition style={{ flex: 1, backgroundColor: palette.ground, paddingTop: insets.top + 4, direction: writingDirection }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <ToolHeader
          title={t("tasbih")}
          subtitle={t("tasbihTotal", { total })}
          action={
            <IconButton icon="refresh" iconSize={19} onPress={() => setConfirmReset(true)} accessibilityLabel={t("tasbihReset")} />
          }
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
          style={{ marginHorizontal: -22, marginBottom: 14 }}
        >
          <View style={{ width: 14 }} />
          {DHIKR_LIST.map((item) => {
            const active = item.id === dhikr.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => selectDhikr(item.id)}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                style={{
                  minHeight: 44,
                  justifyContent: "center",
                  paddingHorizontal: 16,
                  borderRadius: 999,
                  backgroundColor: active ? palette.accent : palette.panel,
                }}
              >
                <AppText variant="naskh" size={15} lineHeight={1.8} numberOfLines={1} color={active ? palette.onAccent : palette.ink}>
                  {item.arabic}
                </AppText>
              </Pressable>
            );
          })}
          <View style={{ width: 14 }} />
        </ScrollView>

        <View style={{ alignItems: "center", marginBottom: 18, minHeight: 96 }}>
          <AppText variant="quran" size={30} lineHeight={1.9} color={palette.goldText} align="center">
            {dhikr.arabic}
          </AppText>
          <AppText size={13.5} color={palette.ink2} align="center">
            {t(dhikr.meaningKey)}
          </AppText>
        </View>

        <TasbihCounter count={count} target={target} onPress={increment} />

        <View style={{ alignItems: "center", marginTop: 22, gap: 8 }}>
          <AppText size={12.5} color={palette.ink2}>
            {t("tasbihTarget")}
          </AppText>
          <SegmentedPills<`${Target}`>
            options={TARGETS.map((value) => ({
              value: `${value}`,
              label: value === 0 ? "∞" : formatNumber(value),
            }))}
            value={`${target}`}
            onChange={(value) => selectTarget(Number(value) as Target)}
          />
        </View>
      </ScrollView>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title={t("tasbihReset")}
        message={t("tasbihResetMsg")}
        confirmLabel={t("tasbihReset")}
        cancelLabel={t("cancel")}
        onConfirm={() => {
          reset();
          setConfirmReset(false);
        }}
      />
    </ScreenTransition>
  );
}
