import Text from "@/components/ui/text";
import View from "@/components/ui/view";
import { cn } from "@/lib/utils";
import { SafeAreaView } from "react-native-safe-area-context";
export default function AppContent() {
  return (
    <SafeAreaView edges={['top']} className={cn(
      "bg-white dark:bg-gray-800",
    )}>
      <View className="flex-1 bg-background">
        <Text>
          Ahmadullah Ahmadi
        </Text>
      </View>
    </SafeAreaView>
  );
}