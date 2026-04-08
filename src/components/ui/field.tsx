import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { useMemo } from "react"
import { Text as RNText, View } from "react-native"

import { cn } from "@/lib/utils"
import { Label } from "./label"
import { Separator } from "./separator"

function FieldSet({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            className={cn(
                "flex flex-col gap-6",
                className
            )}
            {...props}
        />
    )
}

interface FieldLegendProps extends React.ComponentProps<typeof View> {
    variant?: "legend" | "label"
}

function FieldLegend({
    className,
    variant = "legend",
    ...props
}: FieldLegendProps) {
    return (
        <View
            className={cn(
                "mb-3 font-medium",
                variant === "legend" ? "text-base" : "text-sm",
                className
            )}
            {...props}
        />
    )
}

function FieldGroup({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            className={cn(
                "flex w-full flex-col gap-7",
                className
            )}
            {...props}
        />
    )
}

const fieldVariants = cva(
    "flex w-full gap-3",
    {
        variants: {
            orientation: {
                vertical: "flex-col",
                horizontal: "flex-row items-center",
                responsive: "flex-col",
            },
        },
        defaultVariants: {
            orientation: "vertical",
        },
    }
)

interface FieldProps extends React.ComponentProps<typeof View> {
    orientation?: "vertical" | "horizontal" | "responsive"
}

function Field({
    className,
    orientation = "vertical",
    ...props
}: FieldProps & VariantProps<typeof fieldVariants>) {
    return (
        <View
            className={cn(fieldVariants({ orientation }), className)}
            {...props}
        />
    )
}

function FieldContent({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            className={cn(
                "flex flex-1 flex-col gap-1.5",
                className
            )}
            {...props}
        />
    )
}

function FieldLabel({
    className,
    htmlFor,
    ...props
}: React.ComponentProps<typeof Label> & { htmlFor?: string }) {
    return (
        <Label
            className={cn(
                "flex flex-row gap-2",
                className
            )}
            {...props}
            nativeID={htmlFor}
        />
    )
}

function FieldTitle({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            className={cn(
                "flex flex-row items-center gap-2 text-sm font-medium",
                className
            )}
            {...props}
        />
    )
}

function FieldDescription({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            className={cn(
                "text-muted-foreground text-sm font-normal",
                className
            )}
            {...props}
        />
    )
}

interface FieldSeparatorProps extends React.ComponentProps<typeof View> {
    children?: React.ReactNode
}

function FieldSeparator({
    children,
    className,
    ...props
}: FieldSeparatorProps) {
    return (
        <View
            className={cn(
                "relative h-5 text-sm",
                className
            )}
            {...props}
        >
            <Separator className="absolute inset-0 top-1/2" />
            {children && (
                <View
                    className="bg-background text-muted-foreground relative mx-auto px-2"
                >
                    {children}
                </View>
            )}
        </View>
    )
}

interface FieldErrorProps extends React.ComponentProps<typeof View> {
    errors?: Array<{ message?: string } | undefined>
}

function FieldError({
    className,
    children,
    errors,
    ...props
}: FieldErrorProps) {
    const content = useMemo(() => {
        if (children) {
            return children
        }

        if (!errors?.length) {
            return null
        }

        const uniqueErrors = [
            ...new Map(errors.map((error) => [error?.message, error])).values(),
        ]

        if (uniqueErrors?.length == 1) {
            return uniqueErrors[0]?.message
        }

        return (
            <View className="ml-4 flex flex-col gap-1">
                {uniqueErrors.map(
                    (error, index) =>
                        error?.message && (
                            <View key={index} className="flex flex-row gap-2">
                                <RNText>•</RNText>
                                <RNText>{error.message}</RNText>
                            </View>
                        )
                )}
            </View>
        )
    }, [children, errors])

    if (!content) {
        return null
    }

    return (
        <View
            className={cn("text-destructive text-sm font-normal", className)}
            {...props}
        >
            {content}
        </View>
    )
}

export {
    Field, FieldContent, FieldDescription,
    FieldError,
    FieldGroup, FieldLabel, FieldLegend,
    FieldSeparator,
    FieldSet, FieldTitle
}

