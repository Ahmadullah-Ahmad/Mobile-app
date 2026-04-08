import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { Platform, View } from "react-native"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Input } from "./input"
import { TextArea } from "./textarea"

interface InputGroupProps extends React.ComponentProps<typeof View> {
    className?: string
    disabled?: boolean
    error?: boolean
}

function InputGroup({ className, disabled, error, ...props }: InputGroupProps) {
    return (
        <View
            className={cn(
                "relative flex-row w-full items-center rounded-md border shadow-sm",
                "h-12 min-w-0",
                error ? "border-destructive" : "border-input",
                disabled && "opacity-50",
                Platform.OS === "ios" ? "ios:shadow-sm ios:shadow-foreground/10" : "android:elevation-1",
                className
            )}
            {...props}
        />
    )
}

const inputGroupAddonVariants = cva(
    "text-muted-foreground flex h-auto items-center justify-center gap-2 py-1.5 text-sm font-medium",
    {
        variants: {
            align: {
                "inline-start": "pl-3",
                "inline-end": "pr-3",
                "block-start": "w-full justify-start px-3 pt-3",
                "block-end": "w-full justify-start px-3 pb-3",
            },
        },
        defaultVariants: {
            align: "inline-start",
        },
    }
)

interface InputGroupAddonProps extends React.ComponentProps<typeof View> {
    className?: string
    align?: "inline-start" | "inline-end" | "block-start" | "block-end"
}

function InputGroupAddon({
    className,
    align = "inline-start",
    ...props
}: InputGroupAddonProps & VariantProps<typeof inputGroupAddonVariants>) {
    return (
        <View
            className={cn(inputGroupAddonVariants({ align }), className)}
            {...props}
        />
    )
}

const inputGroupButtonVariants = cva(
    "text-sm shadow-none flex-row gap-2 items-center",
    {
        variants: {
            size: {
                xs: "h-6 gap-1 px-2 rounded-md",
                sm: "h-8 px-2.5 gap-1.5 rounded-md",
                "icon-xs": "h-6 w-6 rounded-md p-0",
                "icon-sm": "h-8 w-8 p-0",
            },
        },
        defaultVariants: {
            size: "xs",
        },
    }
)

interface InputGroupButtonProps extends Omit<React.ComponentProps<typeof Button>, "size"> {
    size?: "xs" | "sm" | "icon-xs" | "icon-sm"
}

function InputGroupButton({
    className,
    variant = "ghost",
    size = "xs",
    ...props
}: InputGroupButtonProps & VariantProps<typeof inputGroupButtonVariants>) {
    return (
        <Button
            variant={variant}
            className={cn(inputGroupButtonVariants({ size }), className)}
            {...props}
        />
    )
}

function InputGroupText({ className, ...props }: React.ComponentProps<typeof View>) {
    return (
        <View
            className={cn(
                "text-muted-foreground flex-row items-center gap-2",
                className
            )}
            {...props}
        />
    )
}

function InputGroupInput({
    className,
    ...props
}: React.ComponentProps<typeof Input>) {
    return (
        <Input
            className={cn(
                "flex-1 rounded-none border-0 bg-transparent shadow-none h-full",
                className
            )}
            {...props}
        />
    )
}

function InputGroupTextarea({
    className,
    ...props
}: React.ComponentProps<typeof TextArea>) {
    return (
        <TextArea
            className={cn(
                "flex-1 rounded-none border-0 bg-transparent py-3 shadow-none min-h-[120px]",
                className
            )}
            {...props}
        />
    )
}

export {
    InputGroup,
    InputGroupAddon,
    InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea
}

