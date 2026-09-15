export const QUERY_KEYS = {
  LAST_READ: "last-read",
  BOOKMARKS: "bookmarks",
  setting: (key: string) => `setting:${key}`,
} as const;
