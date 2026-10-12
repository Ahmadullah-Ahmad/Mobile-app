import { type ReactNode, useEffect, useState } from "react";
import {
  Animated,
  Image,
  type LayoutChangeEvent,
  NativeModules,
  StyleSheet,
  View,
} from "react-native";

const SPLASH_IMAGE = require("../../assets/images/splash.png");
const SPLASH_SIZE = Image.resolveAssetSource(SPLASH_IMAGE);
// Edge colours of the splash image, so the screen above and below it continues the artwork.
const SPLASH_TOP = "#261213";
const SPLASH_BOTTOM = "#1a1a1a";

// Once per launch: a remount (e.g. Android recreating the activity on a theme change) skips the splash.
let splashShown = false;

// Mirrors the native SplashPoster; the app mounts only once the image has decoded, so the native poster shows until then.
export default function SplashOverlay({
  children,
  duration = 2500,
}: {
  children: ReactNode;
  duration?: number;
}) {
  const [opacity] = useState(() => new Animated.Value(1));
  const [visible, setVisible] = useState(!splashShown);
  const [loaded, setLoaded] = useState(splashShown);
  const [box, setBox] = useState<{ width: number; height: number } | null>(
    null,
  );

  useEffect(() => {
    if (!loaded || !visible) return;
    splashShown = true;
    // The JS copy now covers the screen, so the native poster behind the app can go.
    NativeModules.SplashPoster?.hide();
    const animation = Animated.timing(opacity, {
      toValue: 0,
      duration: 400,
      delay: duration,
      useNativeDriver: true,
    });
    animation.start(({ finished }) => finished && setVisible(false));
    return () => animation.stop();
  }, [loaded, visible, duration, opacity]);

  const onLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) =>
    setBox({ width: layout.width, height: layout.height });

  const scale = box
    ? Math.min(box.width / SPLASH_SIZE.width, box.height / SPLASH_SIZE.height)
    : 0;
  const imageStyle = box && {
    position: "absolute" as const,
    width: SPLASH_SIZE.width * scale,
    height: SPLASH_SIZE.height * scale,
    left: (box.width - SPLASH_SIZE.width * scale) / 2,
    top: (box.height - SPLASH_SIZE.height * scale) / 2,
  };

  return (
    <>
      {loaded && children}
      {visible && (
        <Animated.View
          pointerEvents="none"
          onLayout={onLayout}
          style={[StyleSheet.absoluteFill, { opacity: loaded ? opacity : 0 }]}
        >
          <View style={[styles.half, { backgroundColor: SPLASH_TOP }]} />
          <View style={[styles.half, { backgroundColor: SPLASH_BOTTOM }]} />
          {imageStyle && (
            <Image
              source={SPLASH_IMAGE}
              resizeMode="stretch"
              fadeDuration={0}
              style={imageStyle}
              onLoad={() => setLoaded(true)}
              onError={() => setLoaded(true)}
            />
          )}
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  half: { flex: 1 },
});
