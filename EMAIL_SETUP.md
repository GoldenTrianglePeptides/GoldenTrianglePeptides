# Transactional Email Setup (Resend)

Your store sends three kinds of emails to customers — order receipts, password
reset links, and (eventually) shipping notifications. These go through
[Resend](https://resend.com): a modern email service with a generous free tier
(3,000 emails/month / 100/day) and excellent deliverability. About 15 minutes,
no coding required.

> Until you finish the steps below, emails are silently skipped (the reset link
> and receipt content are logged on the server). Once the env vars are in place
> and you redeploy, real emails go out immediately.

## Step 1 — Create a Resend account

1. Go to <https://resend.com> → **Sign Up**.
2. Verify your email and log in.

## Step 2 — Add and verify your domain

This is what lets you send mail *from* `support@goldentrianglepeptide.com`
instead of a generic Resend address — looks professional.

1. Dashboard → **Domains** → **Add Domain**.
2. Enter **`goldentrianglepeptide.com`** and submit.
3. Resend shows 3 DNS records (an MX, an SPF TXT, and a DKIM TXT). Each has a
   Name and a Value.

## Step 3 — Add those 3 DNS records in Vercel

Same drill as ImprovMX, just different values.

1. vercel.com → **Domains** → **goldentrianglepeptide.com** → **DNS Records**.
2. For each Resend record, click **Add** and paste in the Name/Type/Value
   exactly as shown. Save.
3. Back in Resend, click **Verify Domain**. Within a few minutes (sometimes up
   to an hour) all three should turn green ✅.

> ⚠️ Resend records use a different subdomain (often `resend._domainkey`) so
> they DON'T conflict with the ImprovMX records you already have.

## Step 4 — Create an API key

1. Resend dashboard → **API Keys** → **Create API Key**.
2. Permission: **Sending access** is enough. Domain: select the verified one.
3. **Copy the key** (it starts with `re_…`). You can only see it once.

## Step 5 — Add 2 env vars to Vercel

1. vercel.com → your project → **Settings → Environments → Production**.
2. Scroll to **Environment Variables** → **Add Environment Variable**.

   | Name | Value |
   | ---- | ----- |
   | `RESEND_API_KEY` | the key from Step 4 |
   | `EMAIL_FROM` | `Golden Triangle Peptides <support@goldentrianglepeptide.com>` |

3. Save.

## Step 6 — Redeploy

Vercel → **Deployments → ⋯ (latest) → Redeploy**. Environment variables only
take effect after a redeploy.

## Step 7 — Test

- **Receipt:** place a real order (or a small test one), complete payment.
  Within seconds a branded order confirmation arrives at the customer's email.
- **Forgot password:** sign out, go to `/login`, click **Forgot password?**,
  enter your email. A reset link arrives; click it and pick a new password.

## Good to know

- **Free tier:** 3,000 emails/month, 100/day. Plenty for a new store.
- **Replies:** emails come from `support@goldentrianglepeptide.com`, so
  customer replies land in your Gmail (via your ImprovMX forwarder).
- **Deliverability:** verifying the domain (with DKIM + SPF) is what keeps
  your mail out of spam folders. Skipping the DNS step works but lands in spam.
- **Going over the free tier:** Resend plans start at $20/mo for 50k emails —
  but you'll only need to upgrade when you're shipping orders by the hundreds.
