import { db } from "./index";
import { categories, events } from "./schema";
import { FIXED_CATEGORIES } from "@/lib/constants";

async function seed() {
  console.log("Seeding database...");

  await db.delete(events);

  for (const cat of FIXED_CATEGORIES) {
    await db.insert(categories).values({ id: cat.id, name: cat.name, color: cat.color }).onConflictDoNothing();
  }

  const customCategories = [
    { id: "golf", name: "Golf", color: "#22c55e" },
    { id: "gym", name: "Gym", color: "#a855f7" },
  ];

  for (const cat of customCategories) {
    await db.insert(categories).values(cat).onConflictDoNothing();
  }

  const initialEvents = [
    {
      id: "1",
      title: "Work",
      dayOfWeek: 1, // Monday
      startTime: "09:00",
      endTime: "17:00",
      userType: "husband" as const,
      categoryId: "work",
      weekType: "both" as const,
    },
    {
      id: "2",
      title: "Team Practice",
      dayOfWeek: 3, // Wednesday
      startTime: "18:00",
      endTime: "20:00",
      userType: "husband" as const,
      categoryId: "golf",
      weekType: "both" as const,
    },
    {
      id: "3",
      title: "Golf",
      dayOfWeek: 6, // Saturday
      startTime: "08:00",
      endTime: "12:00",
      userType: "husband" as const,
      categoryId: "golf",
      weekType: "both" as const,
    },
    {
      id: "4",
      title: "Family Time",
      dayOfWeek: 0, // Sunday
      startTime: "10:00",
      endTime: "18:00",
      userType: "combined" as const,
      categoryId: "family-time",
      weekType: "both" as const,
    },
  ];

  for (const event of initialEvents) {
    await db.insert(events).values(event);
  }

  console.log("Seeding completed.");
}

seed().catch(console.error);
