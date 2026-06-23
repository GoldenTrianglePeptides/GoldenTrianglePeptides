# Golden Triangle Peptides

A full e-commerce website for **Golden Triangle Peptides** — _Precision Peptides. Purpose Driven._

Customers can browse research peptides, create an account, add items to a cart,
and place orders. Each order is saved to the customer's account with a full order
history.

## Features

- 🛍️ **Product catalog** with categories, product detail pages, and related items
- 👤 **User accounts** — register, sign in/out with securely hashed passwords and httpOnly session cookies
- 🛒 **Shopping cart** that persists in the browser
- 💳 **Checkout & orders** — place orders that are saved to your account (demo payment mode out of the box; Stripe-ready)
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

# 2. Create the database and load sample products + demo accounts
npm run db:setup

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts

| Role     | Email                                   | Password    |
| -------- | --------------------------------------- | ----------- |
| Customer | `demo@goldentrianglepeptides.com`       | `demo1234`  |
| Admin    | `admin@goldentrianglepeptides.com`      | `admin1234` |

You can also register a brand-new account from the **Create Account** page.

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
3. **Enable real payments:** the checkout API (`src/app/api/checkout/route.ts`)
   currently records orders in demo mode. Integrate a payment processor such as
   Stripe there and only create the order after the charge succeeds. Add your
   keys to `.env`.

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
  seed.ts           # Sample products + demo accounts
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
