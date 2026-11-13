import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db, schema } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    // Public sign-up is off: this is an editorial site, not a community.
    // Create editors with `npm run create-admin`.
    disableSignUp: process.env.ALLOW_SIGNUP !== "true",
    minPasswordLength: 10,
  },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "user", input: false },
    },
  },
  rateLimit: { enabled: true, window: 60, max: 20 },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
