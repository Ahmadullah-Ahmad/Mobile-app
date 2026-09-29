import { router } from "expo-router";
import type { ReactNode } from "react";
import { View } from "react-native";

import { useSharedUiLang } from "@/context/ui-lang-context";
import { navigate, ROUTES } from "@/lib/routes";

import IconButton from "./icon-button";
import ScreenHeading from "./screen-heading";

interface ToolHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export default function ToolHeader({ title, subtitle, action }: ToolHeaderProps) {
  const { t } = useSharedUiLang();

  const goBack = () => (router.canGoBack() ? router.back() : navigate(ROUTES.home));

  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <IconButton icon="chevronBack" iconSize={20} onPress={goBack} accessibilityLabel={t("back")} />
      <View style={{ flex: 1 }}>
        <ScreenHeading title={title} subtitle={subtitle} />
      </View>
      <View style={{ width: 44, alignItems: "center" }}>{action}</View>
    </View>
  );
}
