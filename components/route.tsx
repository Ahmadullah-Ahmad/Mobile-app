import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ReactNode } from "react";

// Type definition for your menu structure
export interface MenuItem {
  name: string;
  key?: string;
  to?: string;
  icon?: ReactNode;        // ✅ Fix: JSX icon allowed
  subMenu?: MenuItem[];
}

// The function that generates your menu tree
// iconColor should be the theme's foreground color (e.g., from useThemeColors().foreground)
export function generalSettingRoute(locale: string, iconColor: string = '#0d0d0d') {
  return {
    title: "Main Menu",
    // permission: [true],
    mainMenu: [
      {
        name: "Dashboard",
        // permission: [PERMISSIONS.CATEGORY.TRASH_VIEW],
        key: "dashboard",
        to: `/${locale}/dashboard`,
        icon: <MaterialIcons name="dashboard" size={20} color={iconColor} />,
      },
      {
        name: "General Setting",
        key: "setting",
        icon: <Ionicons name="settings-outline" size={20} color={iconColor} />,
        subMenu: [
          {
            name: "Announcement",
            key: "announcement",
            to: `/${locale}/announcement/all`,
            icon: <Ionicons name="megaphone-outline" size={18} color={iconColor} />,
            subMenu: [
              {
                name: "All",
                key: "all_announcement",
                to: `/${locale}/announcement/all`,
                icon: <Ionicons name="list-outline" size={18} color={iconColor} />,
              },
              {
                name: "Draft",
                key: "draft_announcement",
                to: `/${locale}/announcement/draft`,
                icon: <Ionicons name="document-text-outline" size={18} color={iconColor} />,
              },
              {
                name: "Published",
                key: "published_announcement",
                to: `/${locale}/announcement/published`,
                icon: <Ionicons name="checkmark-circle-outline" size={18} color={iconColor} />,
              },
              {
                name: "Archived",
                key: "archived_announcement",
                to: `/${locale}/announcement/archived`,
                icon: <Ionicons name="archive-outline" size={18} color={iconColor} />,
              },
              {
                name: "Trash",
                key: "trash_announcement",
                to: `/${locale}/announcement/trash`,
                icon: <Ionicons name="trash-outline" size={18} color={iconColor} />,
              },
            ],
          },

          {
            name: "Users",
            key: "users",
            to: `/${locale}/users/all`,
            icon: <Ionicons name="people-outline" size={20} color={iconColor} />,
            subMenu: [
              {
                name: "All",
                key: "all_users",
                to: `/${locale}/users/all`,
                icon: <Ionicons name="list-outline" size={18} color={iconColor} />,
              },
              {
                name: "Active",
                key: "active_users",
                to: `/${locale}/users/active`,
                icon: <Ionicons name="checkmark-circle-outline" size={18} color={iconColor} />,
              },
              {
                name: "Inactive",
                key: "inactive_users",
                to: `/${locale}/users/inactive`,
                icon: <Ionicons name="close-circle-outline" size={18} color={iconColor} />,
              },
              {
                name: "Trash",
                key: "users_trash",
                to: `/${locale}/users/trash`,
                icon: <Ionicons name="trash-outline" size={18} color={iconColor} />,
              },
            ],
          },

          {
            name: "Roles",
            key: "roles",
            to: `/${locale}/roles/all`,
            icon: <Ionicons name="shield-checkmark-outline" size={20} color={iconColor} />,
            subMenu: [
              {
                name: "All",
                key: "all_roles",
                to: `/${locale}/roles/all`,
                icon: <Ionicons name="list-outline" size={18} color={iconColor} />,
              },
              {
                name: "Trash",
                key: "roles_trash",
                to: `/${locale}/roles/trash`,
                icon: <Ionicons name="trash-outline" size={18} color={iconColor} />,
              },
            ],
          },

          {
            name: "Permission",
            key: "permission",
            to: `/${locale}/permission`,
            icon: <Ionicons name="key-outline" size={20} color={iconColor} />,
          },
        ],
      }
    ],
  }

}
