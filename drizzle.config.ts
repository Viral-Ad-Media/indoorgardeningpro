import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// Pick up DATABASE_URL from .env.local (e.g. after `vercel env pull`), like the seed scripts do.
// Variables already set in the shell win.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
