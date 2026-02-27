import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(), // hex or tailwind class
});

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  categoryId: text("category_id").references(() => categories.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sun-Sat)
  startTime: text("start_time").notNull(), // "HH:mm"
  endTime: text("end_time").notNull(), // "HH:mm"
  userType: text("user_type", { enum: ["husband", "wife", "combined"] }).notNull(),
  weekType: text("week_type", { enum: ["A", "B", "both"] }).notNull().default("both"),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
