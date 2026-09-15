import { useFocusEffect } from "expo-router";
import { useCallback, useRef, type ReactNode } from "react";
import { Animated, Easing, type StyleProp, type ViewStyle } from "react-native";

interface ScreenTransitionProps {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export default function ScreenTransition({ style, children }: ScreenTransitionProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 220,
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
        useNativeDriver: true,
      }).start();
    }, [progress])
  );

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
