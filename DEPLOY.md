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
Trigger a deploy (Deployments → Redeploy, or push a commit). The build
automatically creates the database tables, loads the product catalog, and
creates your admin account.

## 6. Go live
- Visit your `*.vercel.app` URL.
- Sign in at `/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`, then manage
  products at **/admin** (stock, price, featured, add/remove).
- Add a custom domain under **Settings → Domains**.

## Managing the catalog
Once live, manage products in the **Admin dashboard** — changes save to the
live database instantly. The seed file only provides the initial baseline and
never overwrites your dashboard changes.
