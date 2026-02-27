import { db } from "@/db";
import { events, categories } from "@/db/schema";
import { mergeCategories } from "@/lib/constants";
import { validateEventBody } from "@/lib/api-validation";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [allEvents, dbCats] = await Promise.all([
      db.select().from(events),
      db.select().from(categories),
    ]);
    const allCategories = mergeCategories(dbCats);
    return NextResponse.json({ events: allEvents, categories: allCategories });
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const validated = validateEventBody(body);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { data } = validated;
    const newEvent = await db.insert(events).values({
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description ?? null,
      categoryId: data.categoryId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      userType: data.userType,
      weekType: data.weekType,
    }).returning();
    return NextResponse.json(newEvent[0]);
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
