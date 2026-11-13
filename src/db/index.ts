import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "";
if (!url) {
  console.warn("DATABASE_URL is not set. Copy .env.example to .env.local.");
}

/**
 * Neon's HTTP driver in production (fast, serverless-friendly).
 * Plain node-postgres for a local Postgres during development and tests.
 */
const isNeon = /\.neon\.tech/.test(url);

// Both drivers expose the same query API; type as one so call sites stay simple.
export const db = (
  isNeon
    ? drizzleNeon(neon(url), { schema })
    : drizzlePg(new Pool({ connectionString: url }), { schema })
) as NeonHttpDatabase<typeof schema>;

export { schema };
