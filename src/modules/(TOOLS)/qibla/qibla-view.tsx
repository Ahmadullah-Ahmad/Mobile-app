import { useRef } from "react";
import { Animated, Linking, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppSheet } from "@/context/sheet-context";
import { useSharedUiLang } from "@/context/ui-lang-context";
import { useDirection } from "@/hooks/use-direction";
import { usePalette } from "@/hooks/use-palette";
import { qiblaBearing } from "@/modules/(PRAYER)/prayer-times/prayer-calc";
import { usePrayerLocation } from "@/modules/(PRAYER)/prayer-times/prayer-hooks";
import AppText from "@/UI/app-text";
import IconButton from "@/UI/icon-button";
import PillButton from "@/UI/pill-button";
import ScreenTransition from "@/UI/screen-transition";
import ToolHeader from "@/UI/tool-header";

import QiblaDial from "./qibla-dial";
import { useCompassHeading } from "./qibla-hooks";

export default function QiblaView() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { t, formatNumber } = useSharedUiLang();
  const { writingDirection } = useDirection();
  const { openSheet } = useAppSheet();
  const { location } = usePrayerLocation();
  const qibla = qiblaBearing(location);
  const { rotation, permission, requestPermission, hasHeading, aligned, lowAccuracy } = useCompassHeading(qibla);
  const staticRotation = useRef(new Animated.Value(0)).current;

  const status = aligned
    ? t("qiblaAligned")
    : hasHeading
      ? t("qiblaTurn")
      : permission === "denied"
        ? t("qiblaNoPermission")
        : t("qiblaNoCompass");

  return (
    <ScreenTransition style={{ flex: 1, backgroundColor: palette.ground, paddingTop: insets.top + 4, direction: writingDirection }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <ToolHeader
          title={t("qibla")}
          subtitle={location.label}
          action={<IconButton icon="pin" iconSize={19} onPress={() => openSheet("prayerCity")} accessibilityLabel={t("changeCity")} />}
        />

        <View style={{ alignItems: "center", marginVertical: 12 }}>
          <AppText variant="heading" size={34} lineHeight={1.3} color={aligned ? palette.goldText : palette.ink}>
            {`${formatNumber(Math.round(qibla))}°`}
          </AppText>
          <AppText size={13} color={palette.ink2} align="center">
            {t("qiblaBearing")}
          </AppText>
        </View>

        <QiblaDial qibla={qibla} rotation={hasHeading ? rotation : staticRotation} aligned={aligned} />

        <View
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 24,
            backgroundColor: aligned ? palette.secondarySoft : palette.panel,
            alignItems: "center",
            gap: 10,
          }}
        >
          <AppText variant="uiMedium" size={15} align="center" color={aligned ? palette.secondaryStrong : palette.ink}>
            {status}
          </AppText>
          {lowAccuracy && hasHeading ? (
            <AppText size={12.5} color={palette.ink2} align="center">
              {t("qiblaCalibrate")}
            </AppText>
          ) : null}
          {permission === "denied" ? (
            <PillButton size="sm" label={t("openSettings")} onPress={() => Linking.openSettings()} />
          ) : permission === "unknown" && !hasHeading ? (
            <PillButton size="sm" label={t("qiblaAllow")} onPress={requestPermission} />
          ) : null}
        </View>

        <AppText size={11.5} color={palette.ink2} align="center" style={{ marginTop: 14 }}>
          {t("qiblaNote")}
        </AppText>
      </ScrollView>
    </ScreenTransition>
  );
}
