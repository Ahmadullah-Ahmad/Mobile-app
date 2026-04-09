import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
  type GestureResponderEvent,
  type LayoutRectangle,
} from "react-native";
import { cn } from "@/lib/utils";

// ─── Context ─────────────────────────────────────────────────────────────────

const Ctx = React.createContext<{
  open: boolean;
  setOpen: (v: boolean) => void;
  anchor: LayoutRectangle | null;
  setAnchor: (r: LayoutRectangle) => void;
}>({
  open: false,
  setOpen: () => {},
  anchor: null,
  setAnchor: () => {},
});

// ─── Root ────────────────────────────────────────────────────────────────────

function ContextMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [anchor, setAnchor] = React.useState<LayoutRectangle | null>(null);

  return (
    <Ctx.Provider value={{ open, setOpen, anchor, setAnchor }}>
      {children}
    </Ctx.Provider>
  );
}

// ─── Trigger (long-press) ────────────────────────────────────────────────────

function ContextMenuTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<View>(null);
  const { setOpen, setAnchor } = React.useContext(Ctx);

  const handleLongPress = (_e: GestureResponderEvent) => {
    ref.current?.measure((_x, _y, width, height, pageX, pageY) => {
      setAnchor({ x: pageX, y: pageY, width, height });
      setOpen(true);
    });
  };

  return (
    <Pressable
      ref={ref}
      onLongPress={handleLongPress}
      delayLongPress={400}
      className={className}
    >
      {children}
    </Pressable>
  );
}

// ─── Content (modal overlay) ─────────────────────────────────────────────────

function ContextMenuContent({
  children,
  className,
  align = "end",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
}) {
  const { open, setOpen, anchor } = React.useContext(Ctx);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const { width: SW, height: SH } = Dimensions.get("window");

  React.useEffect(() => {
    if (open) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 20,
          stiffness: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open]);

  if (!open || !anchor) return null;

  let left = anchor.x;
  if (align === "end") left = anchor.x + anchor.width - size.width;
  else if (align === "center")
    left = anchor.x + (anchor.width - size.width) / 2;
  left = Math.max(12, Math.min(left, SW - size.width - 12));

  let top = anchor.y + anchor.height + 4;
  if (top + size.height > SH - 32) top = anchor.y - size.height - 4;

  return (
    <Modal visible transparent statusBarTranslucent animationType="none">
      <TouchableWithoutFeedback onPress={() => setOpen(false)}>
        <Animated.View className="flex-1 bg-black/20" style={{ opacity: fadeAnim }}>
          <TouchableWithoutFeedback>
            <Animated.View
              onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout;
                setSize({ width, height });
              }}
              className={cn(
                "absolute bg-card rounded-xl overflow-hidden border border-border",
                Platform.OS === "ios" ? "ios:shadow-xl" : "android:elevation-8",
                className
              )}
              style={{
                transform: [{ scale: scaleAnim }],
                top,
                left,
                minWidth: 180,
                maxWidth: SW - 24,
              }}
            >
              <View className="py-1">{children}</View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── Item ────────────────────────────────────────────────────────────────────

function ContextMenuItem({
  children,
  icon,
  destructive = false,
  disabled = false,
  onSelect,
  className,
}: {
  children: React.ReactNode;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  destructive?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  className?: string;
}) {
  const { setOpen } = React.useContext(Ctx);

  return (
    <Pressable
      onPress={() => {
        onSelect?.();
        setOpen(false);
      }}
      disabled={disabled}
      className={cn(
        "flex-row items-center px-4 py-3 active:bg-muted/50",
        disabled && "opacity-50",
        className
      )}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={destructive ? "#dc2626" : undefined}
          className={cn("mr-3", destructive ? "text-destructive" : "text-foreground")}
        />
      )}
      <Text
        className={cn(
          "flex-1 text-base",
          destructive ? "text-destructive" : "text-foreground"
        )}
      >
        {children}
      </Text>
    </Pressable>
  );
}

// ─── Separator ───────────────────────────────────────────────────────────────

function ContextMenuSeparator({ className }: { className?: string }) {
  return <View className={cn("h-px bg-border my-1", className)} />;
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
};
