import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import { useSharedUiLang } from "@/context/ui-lang-context";
import { useDirection } from "@/hooks/use-direction";
import { useIconColors } from "@/hooks/use-icon-colors";
import { navigate, ROUTES } from "@/lib/routes";

export default function SurahsContinueReading({
  lastSurahId,
}: {
  lastSurahId?: number;
}) {
  const { primary } = useIconColors();
  const { flexRow, chevronForward } = useDirection();
  const { t } = useSharedUiLang();
  if (lastSurahId == null) return null;

  return (
    <View className="px-4 pt-3 pb-1 bg-background">
      <Pressable
        onPress={() => navigate(ROUTES.surah(lastSurahId))}
        style={{ flexDirection: flexRow }}
        className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 items-center justify-between"
      >
        <Text className="text-primary font-medium text-sm">
          {t("continueReading")}
        </Text>
        <Ionicons name={chevronForward} size={20} color={primary} />
      </Pressable>
    </View>
  );
}
