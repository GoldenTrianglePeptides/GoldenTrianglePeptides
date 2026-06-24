# Golden Triangle Peptides

A full e-commerce website for **Golden Triangle Peptides** — _Precision Peptides. Purpose Driven._

Customers can browse research peptides, create an account, add items to a cart,
and place orders. Each order is saved to the customer's account with a full order
history.

## Features

- 🛍️ **Product catalog** with categories, product detail pages, and related items
- 👤 **User accounts** — register, sign in/out with securely hashed passwords and httpOnly session cookies
- 🛒 **Shopping cart** that persists in the browser
- 💳 **Crypto checkout** — pay with Bitcoin, Ethereum, USDT, USDC and more via NOWPayments; funds settle directly to your own wallet
- 📦 **Order history & confirmation** pages
- 🔐 **Admin dashboard** (`/admin`) showing orders, revenue, products, and customers
- 📱 Responsive design in the brand's navy & gold theme

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router) + React 19 + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Prisma 6](https://www.prisma.io/) ORM with **SQLite** (zero-config local DB)
- [jose](https://github.com/panva/jose) for signed session JWTs + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) for passwords
- [zod](https://zod.dev/) for input validation

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Create the database and load sample products + the admin account
npm run db:setup

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Admin account

The seed creates one admin user using the `ADMIN_EMAIL` / `ADMIN_PASSWORD`
environment variables (defaults to `admin@goldentrianglepeptides.com` /
`admin1234` for local development — override these for production).

Customer accounts are created via the **Create Account** page.

## Useful Scripts

| Command             | Description                               |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Start the development server              |
| `npm run build`     | Production build                          |
| `npm run start`     | Run the production build                  |
| `npm run db:setup`  | Create the DB schema and seed sample data |
| `npm run db:seed`   | Re-seed sample data                       |
| `npm run db:studio` | Open Prisma Studio to browse the database |

## Configuration

Environment variables (see `.env.example`):

- `AUTH_SECRET` — secret used to sign session cookies. **Set this to a long random
  value in production.** A development fallback is used if it's not set.

The database location is configured directly in `prisma/schema.prisma`
(`file:./dev.db`), so no `DATABASE_URL` is needed for local development.

## Going to Production

1. **Set `AUTH_SECRET`** to a strong random value.
2. **Switch to a hosted database** (recommended): in `prisma/schema.prisma`, change
   the datasource to `provider = "postgresql"` with `url = env("DATABASE_URL")`,
   set `DATABASE_URL`, then run `npx prisma migrate deploy`.
3. **Crypto payments:** the store takes cryptocurrency at checkout via
   NOWPayments (non-custodial — funds settle directly to your own wallet). See
   `CRYPTO_SETUP.md` for a step-by-step guide to setting your API key, IPN
   secret, and payout wallet address.

## Compliance Note

All products are presented as **research-use-only** materials and are **not for
human or animal consumption**. The site includes the appropriate disclaimers and
an age/qualification acknowledgement at registration. Before operating a live
store, review the legal and regulatory requirements that apply to selling these
products in your jurisdiction.

## Project Structure

```
prisma/
  schema.prisma     # Database models (User, Product, Order, OrderItem)
  seed.ts           # Sample products + the admin account
src/
  app/
    page.tsx                 # Home
    products/                # Catalog + product detail
    cart/                    # Shopping cart
    checkout/                # Checkout (auth-gated)
    order/[id]/              # Order confirmation / detail
    login/ register/         # Auth pages
    account/                 # Customer order history
    admin/                   # Admin dashboard
    api/auth/                # register / login / logout / me
    api/checkout/            # Order creation
  components/                # Header, Footer, Cart & Auth providers, etc.
  lib/                       # db, auth, formatting helpers
```
