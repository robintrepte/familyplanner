/**
 * Lightweight API request validation for security and data integrity.
 * No external schema lib — simple checks to reject bad or oversized payloads.
 */

const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/;
const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;
const MAX_TITLE_LENGTH = 500;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_CATEGORY_NAME_LENGTH = 100;

export type EventBody = {
  title: string;
  description?: string | null;
  categoryId: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  userType: "husband" | "wife" | "combined";
  weekType: "A" | "B" | "both";
};

export type CategoryBody = {
  name: string;
  color: string;
};

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v);
}

export function validateEventBody(body: unknown): { ok: true; data: EventBody } | { ok: false; error: string } {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid JSON body" };
  }
  const o = body as Record<string, unknown>;

  const title = o.title;
  if (!isString(title) || title.trim().length === 0) {
    return { ok: false, error: "title is required and must be a non-empty string" };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { ok: false, error: `title must be at most ${MAX_TITLE_LENGTH} characters` };
  }

  const description = o.description;
  if (description !== undefined && description !== null && (!isString(description) || description.length > MAX_DESCRIPTION_LENGTH)) {
    return { ok: false, error: `description must be a string with at most ${MAX_DESCRIPTION_LENGTH} characters` };
  }

  const categoryId = o.categoryId;
  if (categoryId !== undefined && categoryId !== null && !isString(categoryId)) {
    return { ok: false, error: "categoryId must be a string or null" };
  }

  const dayOfWeek = o.dayOfWeek;
  if (!isNumber(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    return { ok: false, error: "dayOfWeek must be an integer 0–6" };
  }

  const startTime = o.startTime;
  if (!isString(startTime) || !TIME_RE.test(startTime)) {
    return { ok: false, error: "startTime must be HH:mm (00:00–23:59)" };
  }

  const endTime = o.endTime;
  if (!isString(endTime) || !TIME_RE.test(endTime)) {
    return { ok: false, error: "endTime must be HH:mm (00:00–23:59)" };
  }

  const userType = o.userType;
  if (userType !== "husband" && userType !== "wife" && userType !== "combined") {
    return { ok: false, error: "userType must be husband, wife, or combined" };
  }

  const weekType = o.weekType;
  if (weekType !== "A" && weekType !== "B" && weekType !== "both") {
    return { ok: false, error: "weekType must be A, B, or both" };
  }

  return {
    ok: true,
    data: {
      title: title.trim(),
      description: description === undefined ? undefined : description === null ? null : (description as string).trim(),
      categoryId: categoryId === undefined || categoryId === null ? null : (categoryId as string),
      dayOfWeek,
      startTime,
      endTime,
      userType,
      weekType,
    },
  };
}

export function validateCategoryBody(body: unknown): { ok: true; data: CategoryBody } | { ok: false; error: string } {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid JSON body" };
  }
  const o = body as Record<string, unknown>;

  const name = o.name;
  if (!isString(name) || name.trim().length === 0) {
    return { ok: false, error: "name is required and must be a non-empty string" };
  }
  if (name.length > MAX_CATEGORY_NAME_LENGTH) {
    return { ok: false, error: `name must be at most ${MAX_CATEGORY_NAME_LENGTH} characters` };
  }

  const color = o.color;
  if (!isString(color) || color.length === 0) {
    return { ok: false, error: "color is required" };
  }
  if (!HEX_COLOR_RE.test(color)) {
    return { ok: false, error: "color must be a hex color (#RRGGBB)" };
  }

  return {
    ok: true,
    data: {
      name: name.trim(),
      color: color.toLowerCase(),
    },
  };
}
