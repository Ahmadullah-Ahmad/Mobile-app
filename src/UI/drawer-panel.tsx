import type { ReactNode } from "react";
import { View, useWindowDimensions } from "react-native";

import { Drawer } from "@/components/ui/drawer";
import { useDirection } from "@/hooks/use-direction";
import { DRAWER_SNAP_POINTS } from "@/lib/constants";

import SheetHeader from "./sheet-header";

interface DrawerPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

// Space hidden below the screen at the lowest snap point; lists pad by this so their end stays reachable.
export function useDrawerBottomSpace(): number {
  const { height } = useWindowDimensions();
  return height * (1 - DRAWER_SNAP_POINTS[0]) + 18;
}

export default function DrawerPanel({
  open,
  onClose,
  title,
  subtitle,
  action,
  children,
}: DrawerPanelProps) {
  const { writingDirection } = useDirection();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      snapPoints={DRAWER_SNAP_POINTS}
      contentClassName="bg-background rounded-t-[40px]"
    >
      <View style={{ flex: 1, direction: writingDirection }}>
        <SheetHeader title={title} subtitle={subtitle} action={action} onClose={onClose} />
        {children}
      </View>
    </Drawer>
  );
}
