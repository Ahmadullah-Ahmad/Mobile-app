import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { Text as RNText, View } from "react-native"

import { cn } from "@/lib/utils"
import { Separator } from "./separator"
import { Slot } from "./Slot"

function ItemGroup({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            className={cn("flex flex-col", className)}
            {...props}
        />
    )
}

function ItemSeparator({
    className,
    ...props
}: React.ComponentProps<typeof Separator>) {
    return (
        <Separator
            data-slot="item-separator"
            orientation="horizontal"
            className={cn("my-0", className)}
            {...props}
        />
    )
}

const itemVariants = cva(
    "flex flex-row items-center border border-transparent rounded-md flex-wrap",
    {
        variants: {
            variant: {
                default: "bg-transparent",
                outline: "border-border",
                muted: "bg-muted/50",
            },
            size: {
                default: "p-4 gap-4",
                sm: "py-3 px-4 gap-2.5",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

interface ItemProps extends React.ComponentProps<typeof View> {
    variant?: "default" | "outline" | "muted"
    size?: "default" | "sm"
    asChild?: boolean
}

function Item({
    className,
    variant = "default",
    size = "default",
    asChild = false,
    ...props
}: ItemProps & VariantProps<typeof itemVariants>) {
    const Comp = asChild ? Slot : View
    return (
        <Comp
            className={cn(itemVariants({ variant, size, className }))}
            {...props}
        />
    )
}

const itemMediaVariants = cva(
    "flex flex-row shrink-0 items-center justify-center gap-2",
    {
        variants: {
            variant: {
                default: "bg-transparent",
                icon: "h-8 w-8 border rounded-sm bg-muted",
                image: "h-10 w-10 rounded-sm overflow-hidden",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

interface ItemMediaProps extends React.ComponentProps<typeof View> {
    variant?: "default" | "icon" | "image"
}

function ItemMedia({
    className,
    variant = "default",
    ...props
}: ItemMediaProps & VariantProps<typeof itemMediaVariants>) {
    return (
        <View
            className={cn(itemMediaVariants({ variant, className }))}
            {...props}
        />
    )
}

function ItemContent({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            className={cn(
                "flex flex-1 flex-col gap-1",
                className
            )}
            {...props}
        />
    )
}

function ItemTitle({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            className={cn(
                "flex flex-row items-center gap-2",
                className
            )}
            {...props}
        />
    )
}

function ItemDescription({ className, ...props }: React.ComponentProps<typeof RNText>) {
    return (
        <RNText
            className={cn(
                "text-muted-foreground text-sm leading-normal font-normal",
                className
            )}
            numberOfLines={2}
            {...props}
        />
    )
}

function ItemActions({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            className={cn("flex flex-row items-center gap-2", className)}
            {...props}
        />
    )
}

function ItemHeader({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            className={cn(
                "flex flex-row w-full items-center justify-between gap-2",
                className
            )}
            {...props}
        />
    )
}

function ItemFooter({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            className={cn(
                "flex flex-row w-full items-center justify-between gap-2",
                className
            )}
            {...props}
        />
    )
}

export {
    Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemHeader, ItemMedia, ItemSeparator,
    ItemTitle
}

