"use client"

import { useThemeColors } from "@/hooks/use-theme-colors"
import { cn } from "@/lib/utils"
import { Ionicons } from '@expo/vector-icons'
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from "react-native"
import { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { buttonVariants } from "./button"
import { Input } from "./input"
import { Separator } from "./separator"
import { Sheet } from "./sheet"
import { Skeleton } from "./skeleton"
import { Slot } from "./Slot"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"



const sidebarMenuButtonVariants = cva(
    "flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm transition-all",
    {
        variants: {
            variant: {
                default: "bg-transparent",
                outline: "bg-white border border-gray-200",
            },
            size: {
                default: "h-8 text-sm",
                sm: "h-7 text-xs",
                lg: "h-12 text-sm p-0",
            },
            active: {
                true: "bg-blue-500 text-white font-medium",
                false: "",
            },
            disabled: {
                true: "opacity-50 pointer-events-none",
                false: "",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            active: false,
            disabled: false,
        },
    }
);

type SidebarContextProps = {
    open: boolean;
    toggle: () => void;
    isMobile: boolean;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
    const context = React.useContext(SidebarContext)
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider.")
    }

    return context
}

function SidebarProvider({ children }: { children: React.ReactNode }) {
    const { width } = useWindowDimensions();
    // Define mobile breakpoint however you want
    const isMobile = width < 768;

    const [open, setOpen] = React.useState(false);

    const toggle = React.useCallback(() => {
        setOpen((o) => !o);
    }, []);

    return (
        <SidebarContext.Provider value={{ open, toggle, isMobile }}>
            {children}
        </SidebarContext.Provider>
    );
}

function Sidebar({ children }: { children: React.ReactNode }) {
    const { open, isMobile, toggle } = useSidebar();

    // On mobile, we want a sheet (off-canvas)
    if (isMobile) {
        return (
            <Sheet open={open}
                onClose={toggle}
                title="Right Sheet"
                description="This sheet slides in from the right"
                side="left"
                size="large"
            >
                <View className="flex-1 h-full">
                    {children}
                </View>
            </Sheet>
        );
    }

    // On desktop / tablet (or large width), render a persistent drawer
    const animatedStyles = useAnimatedStyle(() => ({
        width: withTiming(open ? 240 : 80, { duration: 200 }),
    }));

    return (
        <Sheet open={open}
            onClose={toggle}
            title="Right Sheet"
            description="This sheet slides in from the right"
            side="left"
            size="large">
            <View className="flex-1 h-full p-4">
                {children}
            </View>
        </Sheet>
    );
}
function SidebarTrigger({
    className,
    onPress,
    ...props
}: React.ComponentProps<typeof Pressable>) {
    const { toggle } = useSidebar()
    const themeColors = useThemeColors()

    return (
        <Pressable
            className={cn(buttonVariants({ variant: "ghost", size: "icon", }))}
            {...props}
            onPress={(event) => { onPress?.(event); toggle() }}
        >
            <Ionicons name="menu" size={24} color={themeColors.primary} />
            <Text className="sr-only">Toggle Sidebar</Text>
        </Pressable>
    )
}

function SidebarRail({ className, ...props }: React.ComponentProps<typeof Pressable>) {
    const { toggle } = useSidebar()

    return (
        <Pressable
            data-sidebar="rail"
            data-slot="sidebar-rail"
            aria-label="Toggle Sidebar"
            tabIndex={-1}
            onPress={toggle}
            className={cn(
                "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
                "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
                "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
                "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
                "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
                "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
                className
            )}
            {...props}
        />
    )
}

function SidebarInset({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            data-slot="sidebar-inset"
            className={cn(
                "bg-background relative flex w-full flex-1 flex-col",
                "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
                className
            )}
            {...props}
        />
    )
}

function SidebarInput({
    className,
    ...props
}: React.ComponentProps<typeof TextInput>) {
    return (
        <Input
            data-slot="sidebar-input"
            data-sidebar="input"
            className={cn("bg-background h-8 w-full shadow-none", className)}
            {...props}
        />
    )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            data-slot="sidebar-header"
            data-sidebar="header"
            className={cn("flex flex-col gap-2 p-2", className)}
            {...props}
        />
    )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            data-slot="sidebar-footer"
            data-sidebar="footer"
            className={cn("flex flex-col gap-2 p-2", className)}
            {...props}
        />
    )
}

function SidebarSeparator({
    className,
    ...props
}: React.ComponentProps<typeof Separator>) {
    return (
        <Separator
            data-slot="sidebar-separator"
            data-sidebar="separator"
            className={cn("bg-sidebar-border mx-2 w-auto", className)}
            {...props}
        />
    )
}

function SidebarContent({ className, ...props }: React.ComponentProps<typeof ScrollView>) {
    return (
        <ScrollView
            data-slot="sidebar-content"
            data-sidebar="content"
            className={cn(
                "flex-1 flex-col gap-2",
                className
            )}
            showsVerticalScrollIndicator={true}
            {...props}
        />
    )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            data-slot="sidebar-group"
            data-sidebar="group"
            className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
            {...props}
        />
    )
}

function SidebarGroupLabel({
    className,
    asChild = false,
    ...props
}: React.ComponentProps<typeof View> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : View;

    return (
        <Comp
            data-slot="sidebar-group-label"
            data-sidebar="group-label"
            className={cn(
                "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-0 transition-[margin,opacity] duration-200 ease-linear  [&>svg]:size-4 [&>svg]:shrink-0",
                "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
                className
            )}
            {...props}
        />
    )
}

function SidebarGroupAction({
    className,
    asChild = false,
    ...props
}: React.ComponentProps<typeof View> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : View

    return (
        <Comp
            data-slot="sidebar-group-action"
            data-sidebar="group-action"
            className={cn(
                "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
                // Increases the hit area of the button on mobile.
                "after:absolute after:-inset-2 md:after:hidden",
                "group-data-[collapsible=icon]:hidden",
                className
            )}
            {...props}
        />
    )
}

function SidebarGroupContent({
    className,
    ...props
}: React.ComponentProps<typeof View>) {
    return (
        <View
            data-slot="sidebar-group-content"
            data-sidebar="group-content"
            className={cn("w-full text-sm", className)}
            {...props}
        />
    )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            data-slot="sidebar-menu"
            data-sidebar="menu"
            className={cn("flex w-full min-w-0 flex-col gap-1", className)}
            {...props}
        />
    )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            data-slot="sidebar-menu-item"
            data-sidebar="menu-item"
            className={cn("group/menu-item relative", className)}
            {...props}
        />
    )
}


function SidebarMenuButton({
    asChild = false,
    isActive = false,
    variant = "default",
    size = "default",
    tooltip,
    className,
    ...props
}: React.ComponentProps<typeof Pressable> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
} & VariantProps<typeof sidebarMenuButtonVariants>) {
    const Comp = asChild ? Slot : Pressable as any
    const { isMobile, } = useSidebar()

    const button = (
        <Comp
            data-slot="sidebar-menu-button"
            data-sidebar="menu-button"
            data-size={size}
            data-active={isActive}
            className={cn(sidebarMenuButtonVariants({ variant, size, active: isActive }), className)}
            {...props}
        />
    )

    if (!tooltip) {
        return button
    }

    if (typeof tooltip === "string") {
        tooltip = {
            children: tooltip,
        }
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent
                side="right"
                align="center"
                {...tooltip}
            />
        </Tooltip>
    )
}

function SidebarMenuAction({
    className,
    asChild = false,
    showOnHover = false,
    ...props
}: React.ComponentProps<typeof Pressable> & {
    asChild?: boolean
    showOnHover?: boolean
}) {
    const Comp = asChild ? Slot : Pressable as any

    return (
        <Comp
            data-slot="sidebar-menu-action"
            data-sidebar="menu-action"
            className={cn(
                "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
                "after:absolute after:-inset-2 md:after:hidden",
                "peer-data-[size=sm]/menu-button:top-1",
                "peer-data-[size=default]/menu-button:top-1.5",
                "peer-data-[size=lg]/menu-button:top-2.5",
                "group-data-[collapsible=icon]:hidden",
                showOnHover &&
                "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
                className
            )}
            {...props}
        />
    )
}

function SidebarMenuBadge({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sidebar-menu-badge"
            data-sidebar="menu-badge"
            className={cn(
                "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
                "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
                "peer-data-[size=sm]/menu-button:top-1",
                "peer-data-[size=default]/menu-button:top-1.5",
                "peer-data-[size=lg]/menu-button:top-2.5",
                "group-data-[collapsible=icon]:hidden",
                className
            )}
            {...props}
        />
    )
}

function SidebarMenuSkeleton({
    className,
    showIcon = false,
    ...props
}: React.ComponentProps<typeof View> & {
    showIcon?: boolean
}) {
    // Random width between 50 to 90%.
    const width = React.useMemo(() => {
        return `${Math.floor(Math.random() * 40) + 50}%`
    }, [])

    return (
        <View
            data-slot="sidebar-menu-skeleton"
            data-sidebar="menu-skeleton"
            className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
            {...props}
        >
            {showIcon && (
                <Skeleton
                    className="size-4 rounded-md"
                    data-sidebar="menu-skeleton-icon"
                />
            )}
            <Skeleton
                className="h-4 max-w-[--skeleton-width] flex-1"
                data-sidebar="menu-skeleton-text"
                style={{ width: +width, }}
            />
        </View>
    )
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            data-slot="sidebar-menu-sub"
            data-sidebar="menu-sub"
            className={cn(
                "border-border mx-3.5 flex min-w-0 focus:outline-none active:outline-none border-0 outline-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
                "group-data-[collapsible=icon]:hidden",
                className
            )}
            {...props}
        />
    )
}

function SidebarMenuSubItem({
    className,
    ...props
}: React.ComponentProps<typeof View>) {
    return (
        <View
            data-slot="sidebar-menu-sub-item"
            data-sidebar="menu-sub-item"
            className={cn("group/menu-sub-item relative focus:outline-none active:outline-none border-0 outline-0", className)}
            {...props}
        />
    )
}

function SidebarMenuSubButton({
    asChild = false,
    size = "md",
    isActive = false,
    className,
    ...props
}: Omit<React.ComponentProps<typeof Pressable>, 'children'> & {
    asChild?: boolean
    size?: "sm" | "md"
    isActive?: boolean
    children?: React.ReactNode
}) {
    const Comp = asChild ? Slot : Pressable

    return (
        <Comp
            data-slot="sidebar-menu-sub-button"
            data-sidebar="menu-sub-button"
            data-size={size}
            data-active={isActive}
            className={cn(
                "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
                "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
                size === "sm" && "text-xs",
                size === "md" && "text-sm",
                "group-data-[collapsible=icon]:hidden",
                className
            )}
            {...props}
        />
    )
}

export {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar
}

