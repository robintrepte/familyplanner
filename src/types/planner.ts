/** Event as returned by API / used in UI (matches DB schema + id). */
export interface Event {
  id: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  userType: "husband" | "wife" | "combined";
  weekType: "A" | "B" | "both";
}

/** Category as returned by API (fixed + custom, with optional dark/gradient colors). */
export interface Category {
  id: string;
  name: string;
  color: string;
  colorDark?: string;
  colorHusband?: string;
  colorWife?: string;
  colorHusbandDark?: string;
  colorWifeDark?: string;
}
