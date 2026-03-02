import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useThemeColors } from "../../hooks/use-theme-colors";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../ui/collapsible";
import {
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "../ui/sidebar";
import ThemeText from "../ui/text";

const Badge = ({ children }: { children: React.ReactNode }) =>
    children ? (
        <ThemeText className="ms-auto rounded-full bg-primary/70 px-2 py-0.5 text-[10px] font-bold text-foreground  fade-in">
            {children}
        </ThemeText>
    ) : (
        <></>
    );

const MenuWithChild = ({
    item,
    hasAnyPermission,
    sidebarCounts,
    handleClick,
}: any) => {
    const [isOpen, setIsOpen] = React.useState(item.isActive || false);
    const themeColors = useThemeColors();

    React.useEffect(() => {
        setIsOpen(item.isActive || false);
    }, [item.isActive]);

    return (
        <Collapsible key={item.name} open={isOpen} onOpenChange={setIsOpen}>
            <SidebarMenuItem className="flex flex-col">
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        tooltip={item.name}
                        onPress={() => handleClick(item.key)}
                        className="text-xs flex-row py-1 items-center"
                        isActive={item.isActive}
                    >
                        {item.icon && item.icon}
                        <ThemeText>{item.name}</ThemeText>
                        <View className="ms-auto flex-row items-center gap-2">
                            <Badge>{sidebarCounts?.[item.key]}</Badge>
                            <View
                                style={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}
                            >
                                <Ionicons name="chevron-forward" size={16} color={themeColors.foreground} />
                            </View>
                        </View>
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.subMenu?.map((subItem: any, index: number) =>
                            !subItem.subMenu ? (
                                <SidebarMenuSubItem key={`${subItem.name}-${index}`}>
                                    <SidebarMenuSubButton
                                        isActive={subItem.isActive}
                                        asChild
                                        size="md"
                                        style={{
                                            shadowOpacity: 0,
                                            elevation: 0,
                                            outline: "none",
                                        }}
                                    >
                                        <Link
                                            href={subItem.to}
                                            onPress={() => handleClick(subItem.key)}
                                            className="text-xs flex-rows items-center gap-x-2"
                                        >
                                            <View className="flex-row items-center gap-x-2">
                                                {subItem.icon && subItem.icon}
                                                <ThemeText>{subItem.name}</ThemeText>

                                                <View className="ms-auto">
                                                    <Badge>{sidebarCounts?.[subItem.key]}</Badge>
                                                </View>
                                            </View>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            ) : (
                                <View key={`${subItem.name}-${index}`}>
                                    <MenuWithChild
                                        item={subItem}
                                        handleClick={handleClick}
                                        hasAnyPermission={hasAnyPermission}
                                        sidebarCounts={sidebarCounts}
                                    />
                                </View>
                            )
                        )}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
};

const AppSidebarContent = ({
    temMenu,
    hasAnyPermission,
    sidebarCounts,
    handleClick,
}: any) => {
    return (
        <SidebarContent contentContainerStyle={{ flexGrow: 1 }}>
            <SidebarMenu>
                {temMenu?.map((item: any) => (
                    <SidebarGroup key={item.title}>
                        <SidebarGroupLabel className="text-xs py-1 flex-row items-center" >
                            <ThemeText>{item.title}</ThemeText>
                        </SidebarGroupLabel>
                        {item?.mainMenu?.map((item2: any) =>
                            !item2.subMenu ? (
                                <SidebarMenuItem key={item2.name}>
                                    <SidebarMenuButton
                                        asChild={!!item2.to}
                                        className="text-xs py-1 flex-row items-center"
                                        isActive={item2.isActive}
                                    >
                                        {item2.to ? (
                                            <Link
                                                href={item2.to}
                                                onPress={() => handleClick(item2.key)}
                                            >
                                                <View className="text-xs flex-row items-center gap-x-2">

                                                    {item2.icon && item2.icon}
                                                    <ThemeText>{item2.name}</ThemeText>
                                                    <Badge>{sidebarCounts?.[item2.key]}</Badge>
                                                </View>
                                            </Link>
                                        ) : (
                                            <View >
                                                {item2.icon && item2.icon}
                                                <ThemeText>{item2.name}</ThemeText>
                                                <Badge>{sidebarCounts?.[item2.key]}</Badge>
                                            </View>
                                        )}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ) : (
                                <MenuWithChild
                                    key={item2.name}
                                    item={item2}
                                    handleClick={handleClick}
                                    hasAnyPermission={hasAnyPermission}
                                    sidebarCounts={sidebarCounts}
                                />
                            )
                        )}
                    </SidebarGroup>
                ))}
            </SidebarMenu>
        </SidebarContent>
    );
};

export default AppSidebarContent;
