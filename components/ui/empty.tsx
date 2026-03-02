import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { View } from "react-native"

import { cn } from "@/lib/utils"

function Empty({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            className={cn(
                "flex flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6",
                className
            )}
            {...props}
        />
    )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            className={cn(
                "flex max-w-sm flex-col items-center gap-2",
                className
            )}
            {...props}
        />
    )
}

const emptyMediaVariants = cva(
    "flex flex-row shrink-0 items-center justify-center mb-2",
    {
        variants: {
            variant: {
                default: "bg-transparent",
                icon: "bg-muted text-foreground h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

interface EmptyMediaProps extends React.ComponentProps<typeof View> {
    variant?: "default" | "icon"
}

function EmptyMedia({
    className,
    variant = "default",
    ...props
}: EmptyMediaProps & VariantProps<typeof emptyMediaVariants>) {
    return (
        <View
            className={cn(emptyMediaVariants({ variant, className }))}
            {...props}
        />
    )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            className={cn("text-lg font-medium", className)}
            {...props}
        />
    )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            className={cn(
                "text-muted-foreground text-sm",
                className
            )}
            {...props}
        />
    )
}

function EmptyContent({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            className={cn(
                "flex w-full max-w-sm flex-col items-center gap-4",
                className
            )}
            {...props}
        />
    )
}

export {
    Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle
}

