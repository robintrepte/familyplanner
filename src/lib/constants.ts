/** Fixed default category for events. Cannot be deleted or changed. */
export const DEFAULT_CATEGORY_ID = "general";

/** IDs of hardcoded categories that cannot be deleted or edited. */
export const FIXED_CATEGORY_IDS = [
  "general",
  "own-time",
  "family-time",
  "work",
  "sleep",
] as const;

export type FixedCategoryId = (typeof FIXED_CATEGORY_IDS)[number];

/** Hardcoded categories: not stored in DB, always present. */
export const FIXED_CATEGORIES: Array<{
  id: FixedCategoryId;
  name: string;
  color: string;
  colorDark?: string;
  colorHusband?: string;
  colorWife?: string;
  colorHusbandDark?: string;
  colorWifeDark?: string;
}> = [
  { id: "general", name: "General", color: "#6b7280", colorDark: "#9ca3af" },
  { id: "own-time", name: "Own Time", color: "#3b82f6", colorDark: "#60a5fa", colorHusband: "#3b82f6", colorWife: "#ec4899", colorHusbandDark: "#60a5fa", colorWifeDark: "#f472b6" },
  { id: "family-time", name: "Family Time", color: "#dc2626", colorDark: "#f87171" },
  { id: "work", name: "Work", color: "#ea580c", colorDark: "#fb923c" },
  { id: "sleep", name: "Sleep", color: "#e5e5e5", colorDark: "#404040" },
];

export function isFixedCategoryId(id: string): id is FixedCategoryId {
  return (FIXED_CATEGORY_IDS as readonly string[]).includes(id);
}

export type UserType = "husband" | "wife" | "combined";

/**
 * Returns display color for a category. Use when you have categoryId and optional userType
 * (for Own Time: blue for husband, pink for wife; combined uses husband color).
 * Pass isDark for theme-aware colors (fixed categories use colorDark / colorHusbandDark / colorWifeDark in dark mode).
 */
export function getCategoryColor(
  categories: Array<{ id: string; name: string; color: string; colorHusband?: string; colorWife?: string }>,
  categoryId: string,
  userType?: UserType,
  isDark?: boolean
): string {
  const fixed = FIXED_CATEGORIES.find((c) => c.id === categoryId);
  if (fixed) {
    if (fixed.colorHusband != null && fixed.colorWife != null && userType) {
      if (isDark && fixed.colorHusbandDark != null && fixed.colorWifeDark != null) {
        return userType === "wife" ? fixed.colorWifeDark : fixed.colorHusbandDark;
      }
      return userType === "wife" ? fixed.colorWife : fixed.colorHusband;
    }
    if (isDark && fixed.colorDark != null) return fixed.colorDark;
    return fixed.color;
  }
  const fromDb = categories.find((c) => c.id === categoryId);
  return fromDb?.color ?? "#ccc";
}

/** Merge hardcoded categories with DB categories (fixed first, then custom). */
export function mergeCategories(
  dbCategories: Array<{ id: string; name: string; color: string }>
): Array<{ id: string; name: string; color: string; colorDark?: string; colorHusband?: string; colorWife?: string; colorHusbandDark?: string; colorWifeDark?: string }> {
  const fixedIds = new Set(FIXED_CATEGORY_IDS);
  const custom = dbCategories.filter((c) => !fixedIds.has(c.id as FixedCategoryId));
  return [...FIXED_CATEGORIES, ...custom];
}
