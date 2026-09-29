import { Pressable, View } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { usePalette } from "@/hooks/use-palette";
import { navigate } from "@/lib/routes";
import AppText from "@/UI/app-text";
import Icon from "@/UI/icon";

import { HOME_TOOLS } from "./home-config";

export default function HomeTools() {
  const palette = usePalette();
  const { t } = useSharedUiLang();

  return (
    <View style={{ flexDirection: "row", gap: 9, marginBottom: 22 }}>
      {HOME_TOOLS.map((tool) => (
        <Pressable
          key={tool.route}
          onPress={() => navigate(tool.route)}
          accessibilityRole="button"
          className="active:opacity-80"
          style={{ flex: 1, alignItems: "center", gap: 7, paddingVertical: 14, borderRadius: 24, backgroundColor: palette.panel }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: palette.accentSoft,
            }}
          >
            <Icon name={tool.icon} size={22} color={palette.accentStrong} strokeWidth={2.2} />
          </View>
          <AppText size={12} lineHeight={1.3} align="center" numberOfLines={1}>
            {t(tool.labelKey)}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}
