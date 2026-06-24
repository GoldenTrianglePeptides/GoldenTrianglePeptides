import { Resend } from "resend";

// Email sending via Resend (https://resend.com).
//
// Required env vars (set in Vercel -> Settings -> Environment Variables):
//   RESEND_API_KEY  - from resend.com/api-keys
//   EMAIL_FROM      - the verified sender, e.g.
//                     "Golden Triangle Peptides <support@goldentrianglepeptide.com>"
//
// If RESEND_API_KEY is missing the helpers below log and return without
// throwing — useful in dev/preview environments where email isn't wired up yet.
// In production, set the keys so customers actually receive their messages.

const BRAND_NAME = "Golden Triangle Peptides";

let _client: Resend | null = null;
function client(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  _client ??= new Resend(process.env.RESEND_API_KEY);
  return _client;
}

export function isConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

function sender(): string {
  return (
    process.env.EMAIL_FROM ||
    `${BRAND_NAME} <support@goldentrianglepeptide.com>`
  );
}

function formatPriceCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// --- Branded HTML shell -----------------------------------------------------

type EmailShellOptions = {
  preheader?: string;
  body: string;
};

function renderShell({ preheader, body }: EmailShellOptions): string {
  const hiddenPreheader = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(
        preheader,
      )}</div>`
    : "";
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f4f5;font-family:Helvetica,Arial,sans-serif;color:#18181b;">
  ${hiddenPreheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
        <tr>
          <td style="background:#0a1e3f;padding:24px 32px;color:#ffffff;">
            <div style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#d4af37;letter-spacing:0.5px;">${BRAND_NAME}</div>
          </td>
        </tr>
        <tr><td style="padding:32px;font-size:15px;line-height:1.55;color:#27272a;">
          ${body}
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #e4e4e7;background:#fafafa;font-size:12px;color:#71717a;">
          ${BRAND_NAME} · Research-use-only peptides<br/>
          Questions? Reply to this email or contact us at
          <a href="mailto:support@goldentrianglepeptide.com" style="color:#0a1e3f;">support@goldentrianglepeptide.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// --- Order receipt ----------------------------------------------------------

export type ReceiptItem = {
  name: string;
  priceCents: number;
  quantity: number;
};

export type ReceiptInput = {
  to: string;
  orderId: string;
  orderNumber: string;
  items: ReceiptItem[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  shipping: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  orderUrl: string;
};

export async function sendOrderReceipt(input: ReceiptInput): Promise<void> {
  const c = client();
  if (!c) {
    console.warn(
      `[email] RESEND_API_KEY not set — skipping receipt for order ${input.orderNumber}`,
    );
    return;
  }

  const rows = input.items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0;color:#27272a;">${escapeHtml(i.name)}
          <span style="color:#a1a1aa;"> × ${i.quantity}</span>
        </td>
        <td align="right" style="padding:10px 0;color:#27272a;font-weight:600;">
          ${formatPriceCents(i.priceCents * i.quantity)}
        </td>
      </tr>`,
    )
    .join("");

  const body = `
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:22px;color:#0a1e3f;">Thank you for your order!</h1>
    <p style="margin:0 0 20px;color:#52525b;">Order #${escapeHtml(
      input.orderNumber,
    )} — your payment has been confirmed on the blockchain.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${rows}
      <tr><td colspan="2" style="padding:8px 0 0;border-top:1px solid #e4e4e7;"></td></tr>
      <tr>
        <td style="padding:6px 0;color:#71717a;">Subtotal</td>
        <td align="right" style="padding:6px 0;">${formatPriceCents(input.subtotalCents)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#71717a;">Shipping</td>
        <td align="right" style="padding:6px 0;">${formatPriceCents(input.shippingCents)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-top:1px solid #e4e4e7;font-weight:bold;color:#0a1e3f;">Total</td>
        <td align="right" style="padding:10px 0;border-top:1px solid #e4e4e7;font-weight:bold;color:#0a1e3f;font-size:16px;">
          ${formatPriceCents(input.totalCents)}
        </td>
      </tr>
    </table>

    <h2 style="margin:24px 0 6px;font-family:Georgia,serif;font-size:16px;color:#0a1e3f;">Shipping to</h2>
    <div style="color:#27272a;">
      ${escapeHtml(input.shipping.name)}<br/>
      ${escapeHtml(input.shipping.address)}<br/>
      ${escapeHtml(input.shipping.city)}, ${escapeHtml(input.shipping.state)} ${escapeHtml(input.shipping.zip)}
    </div>

    <div style="margin:28px 0 0;">
      <a href="${input.orderUrl}" style="background:#d4af37;color:#0a1e3f;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px;display:inline-block;">View Your Order</a>
    </div>
  `;

  const text = [
    `Thank you for your order!`,
    ``,
    `Order #${input.orderNumber} — payment confirmed.`,
    ``,
    ...input.items.map(
      (i) =>
        `${i.name} × ${i.quantity}  ${formatPriceCents(i.priceCents * i.quantity)}`,
    ),
    ``,
    `Subtotal: ${formatPriceCents(input.subtotalCents)}`,
    `Shipping: ${formatPriceCents(input.shippingCents)}`,
    `Total:    ${formatPriceCents(input.totalCents)}`,
    ``,
    `Shipping to:`,
    `${input.shipping.name}`,
    `${input.shipping.address}`,
    `${input.shipping.city}, ${input.shipping.state} ${input.shipping.zip}`,
    ``,
    `View your order: ${input.orderUrl}`,
  ].join("\n");

  try {
    await c.emails.send({
      from: sender(),
      to: input.to,
      subject: `Order confirmation #${input.orderNumber} — ${BRAND_NAME}`,
      html: renderShell({
        preheader: `Order #${input.orderNumber} confirmed. ${formatPriceCents(input.totalCents)} total.`,
        body,
      }),
      text,
    });
  } catch (err) {
    console.error(
      `[email] Failed to send receipt for order ${input.orderNumber}:`,
      err,
    );
  }
}

// --- Password reset ---------------------------------------------------------

export type PasswordResetInput = {
  to: string;
  resetUrl: string;
  /** How long the link is valid for, in minutes — shown in the email copy. */
  expiresInMinutes: number;
};

export async function sendPasswordResetEmail(
  input: PasswordResetInput,
): Promise<void> {
  const c = client();
  if (!c) {
    console.warn(
      `[email] RESEND_API_KEY not set — skipping password reset for ${input.to}. Reset URL: ${input.resetUrl}`,
    );
    return;
  }

  const body = `
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:22px;color:#0a1e3f;">Reset your password</h1>
    <p style="margin:0 0 16px;color:#27272a;">
      We received a request to reset the password for your ${BRAND_NAME} account.
      Click the button below to choose a new password. This link is valid for
      ${input.expiresInMinutes} minutes.
    </p>
    <div style="margin:24px 0;">
      <a href="${input.resetUrl}" style="background:#d4af37;color:#0a1e3f;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px;display:inline-block;">Reset Password</a>
    </div>
    <p style="margin:24px 0 0;color:#71717a;font-size:13px;">
      If you didn't request this, you can safely ignore this email — your
      password won't change. If the button doesn't work, copy and paste this
      link into your browser:
    </p>
    <p style="word-break:break-all;color:#52525b;font-size:13px;">
      <a href="${input.resetUrl}" style="color:#0a1e3f;">${input.resetUrl}</a>
    </p>
  `;

  const text = [
    `Reset your ${BRAND_NAME} password`,
    ``,
    `We received a request to reset your password. This link is valid for ${input.expiresInMinutes} minutes:`,
    ``,
    input.resetUrl,
    ``,
    `If you didn't request this, you can safely ignore this email.`,
  ].join("\n");

  try {
    await c.emails.send({
      from: sender(),
      to: input.to,
      subject: `Reset your ${BRAND_NAME} password`,
      html: renderShell({
        preheader: `Reset your password. Link valid for ${input.expiresInMinutes} minutes.`,
        body,
      }),
      text,
    });
  } catch (err) {
    console.error(`[email] Failed to send password reset to ${input.to}:`, err);
  }
}
