import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import * as schema from "./schema";

const DEFAULT_DATABASE_PATH = process.env.VERCEL
  ? path.join(tmpdir(), "familyplanner.sqlite")
  : "sqlite.db";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  color text NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id text PRIMARY KEY NOT NULL,
  title text NOT NULL,
  description text,
  category_id text,
  day_of_week integer NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  user_type text NOT NULL,
  week_type text DEFAULT 'both' NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY NOT NULL,
  value text NOT NULL
);
`;

function getDatabasePath(): string {
  const configured = process.env.DATABASE_URL?.trim();
  if (!configured) return DEFAULT_DATABASE_PATH;

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(configured)) {
    throw new Error(
      "DATABASE_URL must be a SQLite file path for better-sqlite3. " +
        "Remote database URLs require a different database adapter."
    );
  }

  if (process.env.VERCEL && !path.isAbsolute(configured)) {
    return path.join(tmpdir(), path.basename(configured));
  }

  return configured;
}

function ensureDatabaseDirectory(databasePath: string) {
  if (databasePath === ":memory:") return;

  const directory = path.dirname(databasePath);
  if (directory !== ".") {
    mkdirSync(directory, { recursive: true });
  }
}

const databasePath = getDatabasePath();
ensureDatabaseDirectory(databasePath);

const sqlite = new Database(databasePath);
sqlite.exec(SCHEMA_SQL);

export const db = drizzle(sqlite, { schema });
