import { ActivityIndicator, Text, View } from "react-native";

interface LoadingSpinnerProps {
  label?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  label,
  fullScreen = false,
}: LoadingSpinnerProps) {
  return (
    <View
      className={
        fullScreen
          ? "flex-1 items-center justify-center bg-background"
          : "items-center py-10"
      }
    >
      <ActivityIndicator size="large" />
      {label ? (
        <Text className="text-muted-foreground mt-3 text-sm">{label}</Text>
      ) : null}
    </View>
  );
}
