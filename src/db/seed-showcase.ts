/**
 * Showcase seed: generic "average family" week for demos and screenshots.
 * Clears events, ensures fixed + custom categories exist, then inserts a full week of example data.
 * Run with: npx tsx src/db/seed-showcase.ts
 *
 * Uses fixed categories (general, own-time, family-time, work, sleep) + custom (kids, hobby, fitness).
 * Day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
import { db } from "./index";
import { categories, events } from "./schema";
import { FIXED_CATEGORIES } from "@/lib/constants";

const showcaseCustomCategories = [
  { id: "kids", name: "Kids", color: "#0d9488" },
  { id: "hobby", name: "Hobby", color: "#22c55e" },
  { id: "fitness", name: "Fitness", color: "#a855f7" },
];

// Routine: 07:00–09:00 morning kids (alt. H/W), 09:00–09:30 breakfast, 10:00–18:00/17:00 work (H), 10:00–14:00 work (W), mix of Work / Home office, 19:00–20:00 dinner, 22:30–06:30 sleep. Mon=Fitness H, Tue=Own time W, Wed=Hobby H, Thu=Fitness W.
const showcaseEvents = [
  // Monday (1)
  { id: "show-m1-1", title: "Morning with kids", dayOfWeek: 1, startTime: "07:00", endTime: "09:00", userType: "husband" as const, categoryId: "kids", weekType: "both" as const },
  { id: "show-m1-2", title: "Breakfast together", dayOfWeek: 1, startTime: "09:00", endTime: "09:30", userType: "combined" as const, categoryId: "family-time", weekType: "both" as const },
  { id: "show-m1-3", title: "Work", dayOfWeek: 1, startTime: "10:00", endTime: "18:00", userType: "husband" as const, categoryId: "work", weekType: "both" as const },
  { id: "show-m1-4", title: "Home office", dayOfWeek: 1, startTime: "10:00", endTime: "14:00", userType: "wife" as const, categoryId: "work", weekType: "both" as const },
  { id: "show-m1-5", title: "Family dinner", dayOfWeek: 1, startTime: "19:00", endTime: "20:00", userType: "combined" as const, categoryId: "family-time", weekType: "both" as const },
  { id: "show-m1-6", title: "Fitness", dayOfWeek: 1, startTime: "20:00", endTime: "21:00", userType: "husband" as const, categoryId: "fitness", weekType: "both" as const },
  { id: "show-m1-7a", title: "Sleep", dayOfWeek: 1, startTime: "22:30", endTime: "06:30", userType: "husband" as const, categoryId: "sleep", weekType: "both" as const },
  { id: "show-m1-7b", title: "Sleep", dayOfWeek: 1, startTime: "22:30", endTime: "06:30", userType: "wife" as const, categoryId: "sleep", weekType: "both" as const },
  // Tuesday (2)
  { id: "show-t2-1", title: "Morning with kids", dayOfWeek: 2, startTime: "07:00", endTime: "09:00", userType: "wife" as const, categoryId: "kids", weekType: "both" as const },
  { id: "show-t2-2", title: "Breakfast together", dayOfWeek: 2, startTime: "09:00", endTime: "09:30", userType: "combined" as const, categoryId: "family-time", weekType: "both" as const },
  { id: "show-t2-3", title: "Home office", dayOfWeek: 2, startTime: "10:00", endTime: "18:00", userType: "husband" as const, categoryId: "work", weekType: "both" as const },
  { id: "show-t2-4", title: "Home office", dayOfWeek: 2, startTime: "10:00", endTime: "14:00", userType: "wife" as const, categoryId: "work", weekType: "both" as const },
  { id: "show-t2-5", title: "Family dinner", dayOfWeek: 2, startTime: "19:00", endTime: "20:00", userType: "combined" as const, categoryId: "family-time", weekType: "both" as const },
  { id: "show-t2-6", title: "Own time", dayOfWeek: 2, startTime: "20:00", endTime: "21:00", userType: "wife" as const, categoryId: "own-time", weekType: "both" as const },
  { id: "show-t2-7a", title: "Sleep", dayOfWeek: 2, startTime: "22:30", endTime: "06:30", userType: "husband" as const, categoryId: "sleep", weekType: "both" as const },
  { id: "show-t2-7b", title: "Sleep", dayOfWeek: 2, startTime: "22:30", endTime: "06:30", userType: "wife" as const, categoryId: "sleep", weekType: "both" as const },
  // Wednesday (3)
  { id: "show-w3-1", title: "Morning with kids", dayOfWeek: 3, startTime: "07:00", endTime: "09:00", userType: "husband" as const, categoryId: "kids", weekType: "both" as const },
  { id: "show-w3-2", title: "Breakfast together", dayOfWeek: 3, startTime: "09:00", endTime: "09:30", userType: "combined" as const, categoryId: "family-time", weekType: "both" as const },
  { id: "show-w3-3", title: "Work", dayOfWeek: 3, startTime: "10:00", endTime: "18:00", userType: "husband" as const, categoryId: "work", weekType: "both" as const },
  { id: "show-w3-4", title: "Home office", dayOfWeek: 3, startTime: "10:00", endTime: "14:00", userType: "wife" as const, categoryId: "work", weekType: "both" as const },
  { id: "show-w3-5", title: "Family dinner", dayOfWeek: 3, startTime: "19:00", endTime: "20:00", userType: "combined" as const, categoryId: "family-time", weekType: "both" as const },
  { id: "show-w3-6", title: "Hobby", dayOfWeek: 3, startTime: "20:00", endTime: "21:00", userType: "husband" as const, categoryId: "hobby", weekType: "both" as const },
  { id: "show-w3-7a", title: "Sleep", dayOfWeek: 3, startTime: "22:30", endTime: "06:30", userType: "husband" as const, categoryId: "sleep", weekType: "both" as const },
  { id: "show-w3-7b", title: "Sleep", dayOfWeek: 3, startTime: "22:30", endTime: "06:30", userType: "wife" as const, categoryId: "sleep", weekType: "both" as const },
  // Thursday (4)
  { id: "show-th4-1", title: "Morning with kids", dayOfWeek: 4, startTime: "07:00", endTime: "09:00", userType: "wife" as const, categoryId: "kids", weekType: "both" as const },
  { id: "show-th4-2", title: "Breakfast together", dayOfWeek: 4, startTime: "09:00", endTime: "09:30", userType: "combined" as const, categoryId: "family-time", weekType: "both" as const },
  { id: "show-th4-3", title: "Home office", dayOfWeek: 4, startTime: "10:00", endTime: "18:00", userType: "husband" as const, categoryId: "work", weekType: "both" as const },
  { id: "show-th4-4", title: "Work", dayOfWeek: 4, startTime: "10:00", endTime: "14:00", userType: "wife" as const, categoryId: "work", weekType: "both" as const },
  { id: "show-th4-5", title: "Family dinner", dayOfWeek: 4, startTime: "19:00", endTime: "20:00", userType: "combined" as const, categoryId: "family-time", weekType: "both" as const },
  { id: "show-th4-6", title: "Fitness", dayOfWeek: 4, startTime: "20:00", endTime: "21:00", userType: "wife" as const, categoryId: "fitness", weekType: "both" as const },
  { id: "show-th4-7a", title: "Sleep", dayOfWeek: 4, startTime: "22:30", endTime: "06:30", userType: "husband" as const, categoryId: "sleep", weekType: "both" as const },
  { id: "show-th4-7b", title: "Sleep", dayOfWeek: 4, startTime: "22:30", endTime: "06:30", userType: "wife" as const, categoryId: "sleep", weekType: "both" as const },
  // Friday (5)
  { id: "show-f5-1", title: "Morning with kids", dayOfWeek: 5, startTime: "07:00", endTime: "09:00", userType: "husband" as const, categoryId: "kids", weekType: "both" as const },
  { id: "show-f5-2", title: "Breakfast together", dayOfWeek: 5, startTime: "09:00", endTime: "09:30", userType: "combined" as const, categoryId: "family-time", weekType: "both" as const },
  { id: "show-f5-3", title: "Home office", dayOfWeek: 5, startTime: "10:00", endTime: "17:00", userType: "husband" as const, categoryId: "work", weekType: "both" as const },
  { id: "show-f5-4", title: "Home office", dayOfWeek: 5, startTime: "10:00", endTime: "14:00", userType: "wife" as const, categoryId: "work", weekType: "both" as const },
  { id: "show-f5-5", title: "Family evening", dayOfWeek: 5, startTime: "18:00", endTime: "21:00", userType: "combined" as const, categoryId: "family-time", weekType: "both" as const },
  { id: "show-f5-6a", title: "Sleep", dayOfWeek: 5, startTime: "22:30", endTime: "06:30", userType: "husband" as const, categoryId: "sleep", weekType: "both" as const },
  { id: "show-f5-6b", title: "Sleep", dayOfWeek: 5, startTime: "22:30", endTime: "06:30", userType: "wife" as const, categoryId: "sleep", weekType: "both" as const },
  // Saturday (6) – same routine: morning activity, family 12–18, dinner 19–20, sleep 22:30–06:30
  { id: "show-sa6-1", title: "Hobby", dayOfWeek: 6, startTime: "08:00", endTime: "12:00", userType: "husband" as const, categoryId: "hobby", weekType: "both" as const },
  { id: "show-sa6-2", title: "Kids activity", dayOfWeek: 6, startTime: "09:00", endTime: "12:00", userType: "wife" as const, categoryId: "kids", weekType: "both" as const },
  { id: "show-sa6-3", title: "Family lunch & afternoon", dayOfWeek: 6, startTime: "12:00", endTime: "18:00", userType: "combined" as const, categoryId: "family-time", weekType: "both" as const },
  { id: "show-sa6-4", title: "Family dinner", dayOfWeek: 6, startTime: "19:00", endTime: "20:00", userType: "combined" as const, categoryId: "family-time", weekType: "both" as const },
  { id: "show-sa6-5a", title: "Sleep", dayOfWeek: 6, startTime: "22:30", endTime: "06:30", userType: "husband" as const, categoryId: "sleep", weekType: "both" as const },
  { id: "show-sa6-5b", title: "Sleep", dayOfWeek: 6, startTime: "22:30", endTime: "06:30", userType: "wife" as const, categoryId: "sleep", weekType: "both" as const },
  // Sunday (0) – Week A: family 09–18, dinner 19–20. Week B: hobby H 08–14, kids W 09–14, dinner 19–20.
  { id: "show-su0-a1", title: "Family brunch & day", dayOfWeek: 0, startTime: "09:00", endTime: "18:00", userType: "combined" as const, categoryId: "family-time", weekType: "A" as const },
  { id: "show-su0-b1", title: "Hobby", dayOfWeek: 0, startTime: "08:00", endTime: "14:00", userType: "husband" as const, categoryId: "hobby", weekType: "B" as const },
  { id: "show-su0-b2", title: "Kids & relax", dayOfWeek: 0, startTime: "09:00", endTime: "14:00", userType: "wife" as const, categoryId: "kids", weekType: "B" as const },
  { id: "show-su0-3", title: "Family dinner", dayOfWeek: 0, startTime: "19:00", endTime: "20:00", userType: "combined" as const, categoryId: "family-time", weekType: "both" as const },
  { id: "show-su0-4a", title: "Sleep", dayOfWeek: 0, startTime: "22:30", endTime: "06:30", userType: "husband" as const, categoryId: "sleep", weekType: "both" as const },
  { id: "show-su0-4b", title: "Sleep", dayOfWeek: 0, startTime: "22:30", endTime: "06:30", userType: "wife" as const, categoryId: "sleep", weekType: "both" as const },
];

async function seedShowcase() {
  console.log("Seeding showcase data (generic family week for demos/screenshots)...");

  for (const cat of FIXED_CATEGORIES) {
    await db.insert(categories).values({ id: cat.id, name: cat.name, color: cat.color }).onConflictDoNothing();
  }
  for (const cat of showcaseCustomCategories) {
    await db.insert(categories).values(cat).onConflictDoNothing();
  }

  await db.delete(events);
  for (const ev of showcaseEvents) {
    await db.insert(events).values(ev);
  }

  console.log(`Showcase seed completed: ${showcaseCustomCategories.length} custom categories, ${showcaseEvents.length} events.`);
}

seedShowcase().catch(console.error);
