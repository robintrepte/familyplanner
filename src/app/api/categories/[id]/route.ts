import { db } from "@/db";
import { categories, events } from "@/db/schema";
import { DEFAULT_CATEGORY_ID, FIXED_CATEGORIES, isFixedCategoryId } from "@/lib/constants";
import { validateCategoryBody } from "@/lib/api-validation";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const ID_MAX_LEN = 100;

function isValidCategoryId(id: string): boolean {
  return id.length > 0 && id.length <= ID_MAX_LEN && /^[\w-]+$/.test(id);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidCategoryId(id)) {
      return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
    }
    if (isFixedCategoryId(id)) {
      return NextResponse.json(
        { error: "This category cannot be deleted" },
        { status: 400 }
      );
    }
    const defaultCat = FIXED_CATEGORIES.find((c) => c.id === DEFAULT_CATEGORY_ID);
    if (defaultCat) {
      await db.insert(categories).values({ id: defaultCat.id, name: defaultCat.name, color: defaultCat.color }).onConflictDoNothing();
    }
    await db.update(events).set({ categoryId: DEFAULT_CATEGORY_ID }).where(eq(events.categoryId, id));
    const deleted = await db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
    if (deleted.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/categories/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidCategoryId(id)) {
      return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
    }
    if (isFixedCategoryId(id)) {
      return NextResponse.json(
        { error: "This category cannot be changed" },
        { status: 400 }
      );
    }
    const body = await req.json().catch(() => null);
    const validated = validateCategoryBody(body);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { data } = validated;
    const updated = await db.update(categories)
      .set({ name: data.name, color: data.color })
      .where(eq(categories.id, id))
      .returning();
    if (updated.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("PATCH /api/categories/[id] error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}
