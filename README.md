# Indoor Gardening Pro

The rebuilt indoorgardeningpro.com: a Next.js site that replaces the old (compromised) WordPress install.

- **Next.js 15** (App Router) + **Tailwind CSS 4**
- **Neon Postgres** via Drizzle ORM
- **Better Auth** (email and password) for the editor area at `/admin/`
- Articles stored as Markdown in the database, rendered and sanitized on the server

Nothing from the old WordPress backup is used except clean, verified image files in `public/uploads/`. All articles in `content/` were written fresh.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL and BETTER_AUTH_SECRET
npm run db:migrate           # create tables in Neon
npm run db:seed              # load the 3 topics, 19 articles and 4 pages from content/
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a long password' ADMIN_NAME='Your Name' npm run create-admin
npm run dev
```

Then open http://localhost:3000 and sign in at http://localhost:3000/sign-in/.

### Environment variables

| Name | What |
|---|---|
| `DATABASE_URL` | Neon connection string (pooled). Any non-Neon URL uses node-postgres instead, handy for local Postgres. |
| `BETTER_AUTH_SECRET` | Random 32+ character secret: `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Public site URL, e.g. `https://indoorgardeningpro.com` |
| `NEXT_PUBLIC_SITE_URL` | Same as above; used for canonical URLs and the sitemap |
| `ALLOW_SIGNUP` | Leave unset. Public sign-up is off; editors are created with `npm run create-admin`. |

## Deploying (Vercel)

1. Import the repo in Vercel. The Vercel Neon integration sets `DATABASE_URL` for you.
2. Add `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL` (Production and Preview).
3. Create the tables and load the content once, from your machine, against the production database:

   ```bash
   npx vercel link && npx vercel env pull .env.local --environment=production
   npm run db:migrate
   npm run db:seed
   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a long password' ADMIN_NAME='Your Name' npm run create-admin
   ```

4. Redeploy so the home page and sitemap are built with the content, then point the domain at Vercel.

The build no longer fails if the database is empty or unreachable: pages that are prerendered at build
time (`/` and `/sitemap.xml`) render with no articles and log a warning, then fill in on their next
revalidation. Runtime database errors are still thrown as usual.

## Content

- `content/*.md`: the seed articles and pages. Front matter sets title, excerpt, topic (`category`), featured image and dates. File name = URL slug.
- After seeding, edit content in `/admin/`. Re-running `db:seed` overwrites articles that share a slug with a file in `content/`.

## URLs

- Articles, pages and topic hubs live at `/<slug>/`, matching the old WordPress URLs.
- Old dated permalinks (`/2022/04/16/<slug>/`) 301 to `/<slug>/`.
- `/wp-admin/` and `/wp-login.php` redirect to the new sign-in.

## Scripts

| Script | |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run db:generate` | Create a migration after editing `src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Load `content/` into the database |
| `npm run create-admin` | Create or reset an editor account |
