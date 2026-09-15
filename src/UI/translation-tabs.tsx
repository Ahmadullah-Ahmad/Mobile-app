import { Text, View, type StyleProp, type ViewStyle } from "react-native";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSharedUiLang } from "@/context/ui-lang-context";
import { useTranslationLang } from "@/hooks/use-translation-lang";
import { isTranslationLang, TRANSLATION_OPTIONS } from "@/lib/constants";
import { FONTS } from "@/lib/fonts";

export default function TranslationTabs({ style }: { style?: StyleProp<ViewStyle> }) {
  const { t, isRTL } = useSharedUiLang();
  const { lang, setLang } = useTranslationLang();

  return (
    <View style={style}>
      {/* Tabs only reads `value` on mount; the key keeps it in sync when home or the reader changes it. */}
      <Tabs
        key={lang}
        value={lang}
        onValueChange={(value) => {
          if (isTranslationLang(value)) setLang(value);
        }}
      >
        <TabsList className="h-12 rounded-full">
          {TRANSLATION_OPTIONS.map((option) => (
            <TabsTrigger key={option.value} value={option.value} className="h-10 rounded-full">
              <Text style={{ fontFamily: isRTL ? FONTS.naskh : FONTS.latin }}>
                {t(option.labelKey)}
              </Text>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </View>
  );
}
