import { useRef, type ReactNode } from "react";
import { Animated, Easing, type StyleProp, type ViewStyle } from "react-native";

interface PageEnterProps {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

// Motion only, no opacity: the page is fully visible from its first frame, so a heavy
// first render can never show an empty background. Starts after layout so frames aren't dropped.
export default function PageEnter({ style, children }: PageEnterProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const started = useRef(false);

  const start = () => {
    if (started.current) return;
    started.current = true;
    Animated.timing(progress, {
      toValue: 1,
      duration: 320,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      onLayout={start}
      style={[
        style,
        {
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [36, 0] }) },
            { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
