import React, { ReactElement, ReactNode } from "react";
import {
    View,
    ViewProps
} from "react-native";

type SlotProps = ViewProps & {
    children?: ReactNode;
    asChild?: boolean;
};

/**
 * Slot component for React Native
 *
 * Allows a child component to receive props from its parent while maintaining its own props.
 * Useful for creating flexible, composable components.
 *
 * Supports: View, Pressable, TouchableOpacity, and other React Native components
 *
 * @example
 * ```tsx
 * <Slot style={{ padding: 10 }} onPress={() => console.log('pressed')}>
 *   <Pressable style={{ backgroundColor: 'red' }}>
 *     <Text>Click me</Text>
 *   </Pressable>
 * </Slot>
 * ```
 */
export function Slot({ children, style, asChild = true, ...props }: SlotProps) {
    // If asChild is false, render as a normal View
    if (!asChild) {
        return (
            <View style={style} {...props}>
                {children}
            </View>
        );
    }

    // If children is not a valid React element, render as-is
    if (!React.isValidElement(children)) {
        return <>{children}</>;
    }

    // Type assertion so TypeScript knows children has props
    const child = children as ReactElement<any>;

    // Merge props from parent and child
    const mergedProps = mergeSlotProps(props, child.props, style);

    return React.cloneElement(child, mergedProps);
}

/**
 * Merges props from Slot parent with child component props
 * Handles special cases for event handlers, styles, and other props
 */
function mergeSlotProps(
    slotProps: any,
    childProps: any,
    slotStyle?: any
): any {
    const merged: any = { ...slotProps };

    // Merge styles - child styles take precedence
    if (slotStyle || childProps.style) {
        merged.style = [slotStyle, childProps.style].filter(Boolean);
    }

    // Merge className for NativeWind support
    if (slotProps.className || childProps.className) {
        merged.className = [slotProps.className, childProps.className]
            .filter(Boolean)
            .join(" ");
    }

    // Merge event handlers - both parent and child handlers will be called
    const eventHandlers = [
        "onPress",
        "onPressIn",
        "onPressOut",
        "onLongPress",
        "onHoverIn",
        "onHoverOut",
        "onFocus",
        "onBlur",
        "onLayout",
    ];

    eventHandlers.forEach((handler) => {
        const slotHandler = slotProps[handler];
        const childHandler = childProps[handler];

        if (slotHandler && childHandler) {
            // Both handlers exist - call both
            merged[handler] = (...args: any[]) => {
                slotHandler(...args);
                childHandler(...args);
            };
        } else if (childHandler) {
            // Only child handler exists
            merged[handler] = childHandler;
        }
        // If only slot handler exists, it's already in merged from spreading slotProps
    });

    // Merge other child props (child props override slot props for non-special cases)
    Object.keys(childProps).forEach((key) => {
        if (
            key !== "style" &&
            key !== "className" &&
            !eventHandlers.includes(key) &&
            childProps[key] !== undefined
        ) {
            merged[key] = childProps[key];
        }
    });

    return merged;
}

/**
 * Slottable component - marks content as slottable
 * Useful when you want to pass multiple children but only slot one of them
 */
export function Slottable({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

/**
 * Hook to check if a component is being used as a slot child
 */
export function useSlottable(children: ReactNode): {
    slottable: ReactElement | null;
    rest: ReactNode[];
} {
    const childrenArray = React.Children.toArray(children);
    const slottable = childrenArray.find(
        (child) =>
            React.isValidElement(child) && child.type === Slottable
    ) as ReactElement<{ children: ReactNode }> | undefined;

    const rest = childrenArray.filter((child) => child !== slottable);

    return {
        slottable: slottable
            ? (slottable.props.children as ReactElement)
            : null,
        rest,
    };
}
