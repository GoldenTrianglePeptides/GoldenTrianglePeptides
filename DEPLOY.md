# Deploying Golden Triangle Peptides (Vercel + Neon Postgres)

This app runs on **Vercel** with a **Postgres** database. Both have free tiers.

## 1. Push the code to GitHub
The repo is already on GitHub. Make sure your latest branch is pushed.

## 2. Create the Vercel project
1. Go to **vercel.com** and sign in with **GitHub**.
2. **Add New… → Project**, import this repository, and pick the branch.
3. Don't deploy yet — set up the database and env vars first (next steps).

## 3. Add a Postgres database
1. In the project, open the **Storage** tab → **Create Database** → **Postgres** (Neon).
2. Connect it to the project. This automatically adds `DATABASE_URL` and
   `DATABASE_URL_UNPOOLED` to the project's environment variables.

## 4. Add the remaining environment variables
In **Settings → Environment Variables**, add:

| Name             | Value                                                            |
| ---------------- | ---------------------------------------------------------------- |
| `AUTH_SECRET`    | a long random string (`openssl rand -base64 48`)                 |
| `ADMIN_EMAIL`    | the email you want to log into `/admin` with                     |
| `ADMIN_PASSWORD` | a strong password for the admin account                          |

## 5. Deploy
Trigger a deploy (Deployments → Redeploy, or push a commit). The build runs
`prisma db push`, which **creates or updates the database tables without
destroying existing data** (a deploy that would require a destructive schema
change fails loudly instead of dropping data — handle those deliberately).

> The build no longer re-seeds on every deploy, so it can't overwrite your
> catalog, undo product deletions, or reset the admin password.

### First-time only: load the starter catalog + admin
On a brand-new database, seed the baseline products and admin account **once**
by running the seed against the production database:

```bash
# with the production DATABASE_URL available in your shell
npm run db:seed
```

(You can also manage everything from the **/admin** dashboard instead.)

## 6. Go live
- Visit your `*.vercel.app` URL.
- Sign in at `/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`, then manage
  products at **/admin** (stock, price, featured, add/remove).
- Add a custom domain under **Settings → Domains**.

## Managing the catalog
Once live, manage products in the **Admin dashboard** — changes save to the
live database instantly and are never overwritten by deploys.

## Later: adopt migrations
For full safety as the schema evolves, switch from `prisma db push` to
versioned migrations (`prisma migrate deploy`). This is a one-time setup that
baselines the existing database — do it when you have direct database access.
