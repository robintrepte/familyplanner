import { db } from "@/db";
import { categories } from "@/db/schema";
import { mergeCategories } from "@/lib/constants";
import { validateCategoryBody } from "@/lib/api-validation";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dbCats = await db.select().from(categories);
    const allCategories = mergeCategories(dbCats);
    return NextResponse.json(allCategories);
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const validated = validateCategoryBody(body);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { data } = validated;
    const id = crypto.randomUUID();
    const newCategory = await db.insert(categories).values({
      id,
      name: data.name,
      color: data.color,
    }).returning();
    return NextResponse.json(newCategory[0]);
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
