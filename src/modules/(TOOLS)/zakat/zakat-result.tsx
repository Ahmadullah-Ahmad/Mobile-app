import { View } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { usePalette } from "@/hooks/use-palette";
import AppText from "@/UI/app-text";

import { formatAmount, type calculateZakat } from "./zakat-config";

type ZakatResultProps = ReturnType<typeof calculateZakat>;

function ResultLine({ label, value }: { label: string; value: string }) {
  const palette = usePalette();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
      <AppText size={13} color={palette.heroInk2}>
        {label}
      </AppText>
      <AppText size={13.5} color={palette.heroInk}>
        {value}
      </AppText>
    </View>
  );
}

export default function ZakatResult({ net, nisab, eligible, due }: ZakatResultProps) {
  const palette = usePalette();
  const { t, isRTL } = useSharedUiLang();

  const message =
    nisab === null ? t("zakatNeedPrice") : eligible ? t("zakatDueLabel") : t("zakatBelowNisab");

  return (
    <View style={{ backgroundColor: palette.heroBg, borderRadius: 30, padding: 20, gap: 8, marginBottom: 18 }}>
      <AppText size={12.5} color={palette.heroInk2} align="start">
        {message}
      </AppText>
      <AppText variant="heading" size={34} lineHeight={1.3} color={palette.heroInk} align="start">
        {formatAmount(due, isRTL)}
      </AppText>
      <View style={{ height: 1, backgroundColor: palette.heroTrack, marginVertical: 4 }} />
      <ResultLine label={t("zakatNet")} value={formatAmount(net, isRTL)} />
      <ResultLine label={t("zakatNisab")} value={nisab === null ? "—" : formatAmount(nisab, isRTL)} />
    </View>
  );
}
