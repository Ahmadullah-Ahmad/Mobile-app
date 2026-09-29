import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Input } from "@/components/ui/input";
import { useSharedUiLang } from "@/context/ui-lang-context";
import { useDirection } from "@/hooks/use-direction";
import { usePalette } from "@/hooks/use-palette";
import { FONTS } from "@/lib/fonts";
import AppText from "@/UI/app-text";
import IconButton from "@/UI/icon-button";
import ScreenTransition from "@/UI/screen-transition";
import SegmentedPills from "@/UI/segmented-pills";
import ToolHeader from "@/UI/tool-header";

import { ZAKAT_SECTIONS, type NisabBasis } from "./zakat-config";
import { useZakat } from "./zakat-hooks";
import ZakatResult from "./zakat-result";

export default function ZakatView() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useSharedUiLang();
  const { writingDirection } = useDirection();
  const { inputs, result, setField, setBasis, clear } = useZakat();

  return (
    <ScreenTransition style={{ flex: 1, backgroundColor: palette.ground, paddingTop: insets.top + 4, direction: writingDirection }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 28 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ToolHeader
            title={t("zakat")}
            subtitle={t("zakatSub")}
            action={<IconButton icon="refresh" iconSize={19} onPress={clear} accessibilityLabel={t("zakatClear")} />}
          />

          <ZakatResult {...result} />

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 18 }}>
            <AppText size={13.5} align="start" style={{ flex: 1 }}>
              {t("zakatNisabBasis")}
            </AppText>
            <SegmentedPills<NisabBasis>
              options={[
                { value: "silver", label: t("zakatSilver") },
                { value: "gold", label: t("zakatGold") },
              ]}
              value={inputs.basis}
              onChange={setBasis}
            />
          </View>

          {ZAKAT_SECTIONS.map((section) => (
            <View key={section.titleKey} style={{ marginBottom: 16 }}>
              <AppText variant="uiMedium" size={14.5} align="start" style={{ marginHorizontal: 2, marginBottom: 8 }}>
                {t(section.titleKey)}
              </AppText>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {section.fields.map((field) => (
                  <View key={field.key} style={{ flex: 1 }}>
                    <AppText size={12} color={palette.ink2} align="start" style={{ marginHorizontal: 2, marginBottom: 4 }}>
                      {t(field.labelKey)}
                    </AppText>
                    <Input
                      value={inputs.values[field.key] ?? ""}
                      onChangeText={(text) => setField(field.key, text)}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      accessibilityLabel={`${t(section.titleKey)} – ${t(field.labelKey)}`}
                      className="rounded-2xl"
                      style={{ fontFamily: FONTS.latin, fontSize: 16, color: palette.ink, backgroundColor: palette.panel }}
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}

          <AppText size={11.5} color={palette.ink2} align="center" style={{ marginTop: 4 }}>
            {t("zakatNote")}
          </AppText>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenTransition>
  );
}
