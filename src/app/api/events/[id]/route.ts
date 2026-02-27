import { db } from "@/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateEventBody } from "@/lib/api-validation";
import { NextResponse } from "next/server";

const ID_MAX_LEN = 100;

function isValidId(id: string): boolean {
  return id.length > 0 && id.length <= ID_MAX_LEN && /^[\w-]+$/.test(id);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }
    const body = await req.json().catch(() => null);
    const validated = validateEventBody(body);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { data } = validated;
    const updatedEvent = await db
      .update(events)
      .set({
        title: data.title,
        description: data.description ?? null,
        categoryId: data.categoryId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        userType: data.userType,
        weekType: data.weekType,
      })
      .where(eq(events.id, id))
      .returning();
    if (updatedEvent.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(updatedEvent[0]);
  } catch (error) {
    console.error("PATCH /api/events/[id] error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }
    const deleted = await db.delete(events).where(eq(events.id, id)).returning({ id: events.id });
    if (deleted.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/events/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
