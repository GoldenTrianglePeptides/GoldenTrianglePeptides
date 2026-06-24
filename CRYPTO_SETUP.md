# Accepting Crypto Payments (NOWPayments)

Your store takes cryptocurrency at checkout. Customers pay on a secure
NOWPayments page, and the coins are forwarded **straight to your own wallet** —
NOWPayments never holds your money. This guide is what you need to switch it
on. About 15 minutes, no coding required.

> Until you finish the steps below, checkout will refuse new orders with a
> friendly "payments are temporarily unavailable" message rather than recording
> unpaid orders.

## What you'll need

- The crypto wallet address where you want the money to land (your Coinbase,
  MetaMask, Trust Wallet, or an exchange deposit address).
- Access to your project on [vercel.com](https://vercel.com) (where the site is hosted).

## Step 1 — Create a NOWPayments account

1. Go to <https://nowpayments.io> and **Sign Up**.
2. Verify your email and log in.

## Step 2 — Tell NOWPayments which wallet to pay you into

This is the *"funds get wired into my wallet"* part.

1. In the dashboard open **Settings → Payment Settings** (sometimes called
   "Coins settings" / "Outcome wallet").
2. Add your wallet address for each coin you want to receive. For example a
   USDT, BTC, or ETH address.
   - 💡 Tip: receiving in a **stablecoin like USDT or USDC** avoids price swings —
     $100 of sales stays roughly $100.
3. Save. Every customer payment now auto-forwards to this address.

## Step 3 — Get your API key

1. Go to **Settings → API keys**.
2. Click **Add new key** and **copy** it. You'll paste it into Vercel in Step 5.

## Step 4 — Turn on payment notifications (IPN)

This is what tells your store an order has been paid.

1. Go to **Settings → IPN / Instant Payment Notifications**.
2. In the **IPN Secret key** field, create/copy a secret string and save it.
3. Set the **IPN callback URL** to:

   ```
   https://goldentrianglepeptide.com/api/webhooks/nowpayments
   ```

   Save.

## Step 5 — Add 3 settings to Vercel

1. Open your project on vercel.com → **Settings → Environment Variables**.
2. Add these three (apply to **Production**):

   | Name                     | Value                                |
   | ------------------------ | ------------------------------------ |
   | `NOWPAYMENTS_API_KEY`    | the key from Step 3                  |
   | `NOWPAYMENTS_IPN_SECRET` | the secret from Step 4              |
   | `NEXT_PUBLIC_SITE_URL`   | `https://goldentrianglepeptide.com`  |

3. Click **Save**.

## Step 6 — Redeploy

Vercel → **Deployments → ⋯ (on the latest one) → Redeploy**. Environment
variables only take effect after a redeploy.

## Step 7 — Test it

1. Add a product to the cart and go to checkout.
2. Click **Pay with Crypto** — you should land on the NOWPayments payment page.
3. Pay (NOWPayments also has a sandbox for test payments — see their docs).
4. Within a minute the order page flips from *"Waiting for your payment"* to
   *"Thank you for your order!"*, the order shows **paid** in your `/admin`
   dashboard, and the coins arrive in the wallet from Step 2. 🎉

## Good to know

- **Fees:** NOWPayments charges ~0.5% per payment; the coin's network fee also applies.
- **No chargebacks:** crypto payments are final. Refunds are manual (you send coins back yourself).
- **Price lock:** the amount is fixed for ~20 minutes at checkout. If a customer
  waits too long the order shows *expired* and they simply re-order.
- **Verification (KYC):** at higher volumes NOWPayments may ask you to complete
  business verification. Smaller volumes usually work right away.
- **Compliance:** keep your "research use only / not for human consumption"
  product labelling and store terms accurate — payment processors expect correct
  business information.
