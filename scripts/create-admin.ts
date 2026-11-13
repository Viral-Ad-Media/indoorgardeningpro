/**
 * Creates (or promotes) an editor account that can use /admin.
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a long password' ADMIN_NAME='Your Name' npm run create-admin
 */
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../src/db";
import { account, user } from "../src/db/schema";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Editor";
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD.");
  if (password.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters.");

  const hash = await hashPassword(password);
  let [existing] = await db.select().from(user).where(eq(user.email, email));

  if (!existing) {
    [existing] = await db
      .insert(user)
      .values({ id: randomUUID(), email, name, emailVerified: true, role: "admin" })
      .returning();
  } else {
    await db.update(user).set({ role: "admin", updatedAt: new Date() }).where(eq(user.id, existing.id));
  }

  const [cred] = await db
    .select()
    .from(account)
    .where(and(eq(account.userId, existing.id), eq(account.providerId, "credential")));
  if (cred) {
    await db.update(account).set({ password: hash, updatedAt: new Date() }).where(eq(account.id, cred.id));
  } else {
    await db.insert(account).values({
      id: randomUUID(),
      accountId: existing.id,
      providerId: "credential",
      userId: existing.id,
      password: hash,
    });
  }
  console.log(`Admin ready: ${email}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
