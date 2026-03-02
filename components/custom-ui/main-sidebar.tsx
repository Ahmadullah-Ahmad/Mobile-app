import { Sidebar, SidebarFooter } from '@/components/ui/sidebar';
import { usePathname } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { useProfileContext } from '../../contexts/profile-context';
import { useSidebarCountContext } from '../../contexts/sidebar-count-context';
import { useThemeColors } from '../../hooks/use-theme-colors';
import { generalSettingRoute } from '../route';
import AppSidebarContent from './app-sidebar-content';

export function AppSidebar() {
    const { profile, hasAnyPermission } = useProfileContext();
    const themeColors = useThemeColors();
    const [temMenu, setMenu] = React.useState<any[]>([generalSettingRoute('en', themeColors.foreground)]);
    const isDataChanged = React.useRef(false);
    const pathName = usePathname();

    const {
        sidebarCounts,
        getSidebarCounts,
        revalidateSidebarCounts,
        revalidateLoading,
    } = useSidebarCountContext();





    const matchPath = (menuPath: any, currentPath: any) => {
        // Guard against null/undefined currentPath
        if (!currentPath) {
            return false;
        }

        // Split the paths into segments
        const current = currentPath.split('?');

        const menuSegments = menuPath.split('/');
        const currentSegments = current[0]?.split('/');

        // Check if the segments match
        if (menuSegments.length !== currentSegments.length) {
            return false;
        }

        for (let i = 0; i < menuSegments.length; i++) {
            // If the menu segment is a placeholder, continue
            if (currentSegments[i] === '[id]') {
                continue;
            }

            // Compare decoded segments
            if (
                decodeURIComponent(menuSegments[i]) !==
                decodeURIComponent(currentSegments[i])
            ) {
                return false;
            }
        }

        return true;
    };

    const fetchedRef = React.useRef([]);

    const getSidebarCountsDeduped = ({ key }: { key: any }) => {
        if (fetchedRef.current.includes(key as never)) {
            return;
        }
        if (key && profile) {
            fetchedRef.current.push(key as never);
            getSidebarCounts({ key });
        }
    };

    const updateMenuExpansion = (menuData: any, path: any) => {
        return menuData.map((item: any) => {
            let isActive = matchPath(item?.to ?? '', path);
            if (isActive) {
                getSidebarCountsDeduped({ key: item?.key });
            }
            if (item.mainMenu) {
                const updatedMainMenu = updateMenuExpansion(item.mainMenu, path);
                isActive =
                    isActive || updatedMainMenu.some((subItem: any) => subItem.isActive);
                item.mainMenu = updatedMainMenu;
            }
            if (isActive) {
                getSidebarCountsDeduped({ key: item?.key });
            }
            if (item.subMenu) {
                const updatedSubMenu = updateMenuExpansion(item.subMenu, path);
                isActive =
                    isActive || updatedSubMenu.some((subItem: any) => subItem.isActive);
                item.subMenu = updatedSubMenu;
            }
            if (isActive) {
                getSidebarCountsDeduped({ key: item?.key });
            }
            return {
                ...item,
                isActive: isActive,
            };
        });
    };

    React.useEffect(() => {
        if (pathName) {
            const updatedMenu = updateMenuExpansion([generalSettingRoute('en', themeColors.foreground)], pathName);
            setMenu(updatedMenu);
        } else {
            // Set default menu with General Setting expanded
            const defaultMenu = [generalSettingRoute('en', themeColors.foreground)];
            defaultMenu[0].mainMenu = defaultMenu[0].mainMenu.map((item: any) => ({
                ...item,
                isActive: item.key === 'setting', // Expand General Setting by default
            }));
            setMenu(defaultMenu);
        }
    }, [pathName, themeColors.foreground]);

    const handleClick = (key: string) => {
        getSidebarCounts({ key });

        const updatedMenu = temMenu.map((menuItem: any) => {
            const updatedMainMenu = menuItem.mainMenu.map((item: any) => {
                if (item?.key === key) {
                    return {
                        ...item,
                        isActive: !item.isActive, // toggle the isActive property
                    };
                } else if (item.subMenu) {
                    const updatedSubMenu = item.subMenu.map((subItem: any) => {
                        if (subItem?.key === key) {
                            return {
                                ...subItem,
                                isActive: !subItem.isActive, // toggle the isActive property
                            };
                        } else if (subItem.subMenu) {
                            const updatedSubSubMenu = subItem.subMenu.map((subSubItem: any) => {
                                if (subSubItem?.key === key) {
                                    return {
                                        ...subSubItem,
                                        isActive: !subSubItem.isActive, // toggle the isActive property
                                    };
                                } else {
                                    return subSubItem;
                                }
                            });
                            return {
                                ...subItem,
                                subMenu: updatedSubSubMenu,
                            };
                        } else {
                            return subItem;
                        }
                    });
                    return {
                        ...item,
                        subMenu: updatedSubMenu,
                    };
                } else {
                    return item;
                }
            });
            return {
                ...menuItem,
                mainMenu: updatedMainMenu,
            };
        });
        setMenu(updatedMenu);
    };



    return (
        <Sidebar >
            <AppSidebarContent
                temMenu={temMenu}
                handleClick={handleClick}
                hasAnyPermission={hasAnyPermission}
                sidebarCounts={sidebarCounts}
            />
            <SidebarFooter>
                <Text>Footer</Text>
            </SidebarFooter>
        </Sidebar>
    );
}