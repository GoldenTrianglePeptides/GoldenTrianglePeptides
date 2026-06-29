import PolicyPage from "@/components/PolicyPage";

export const metadata = {
  title: "Shipping & FAQ | Golden Triangle Peptides",
  description:
    "Shipping times, tracking, packaging, payment, and answers to common questions about ordering research peptides from Golden Triangle Peptides.",
};

export default function ShippingFaqPage() {
  return (
    <PolicyPage
      title="Shipping & FAQ"
      updated="June 2026"
      sections={[
        {
          heading: "Processing time",
          body: [
            "Orders are processed once payment is confirmed on-chain. Most orders ship within 1–2 business days (Mon–Fri). You'll receive an email when your order is marked shipped.",
          ],
        },
        {
          heading: "Shipping & tracking",
          body: [
            "We ship via tracked, discreet packaging. A tracking number and carrier are added to your order when it ships and are visible on the order page in your account.",
            "Free shipping on orders over $400; a flat $10 rate applies otherwise.",
          ],
        },
        {
          heading: "How do I pay?",
          body: [
            "Orders settle in cryptocurrency. At checkout you'll be taken to a hosted invoice where you choose a coin and pay. Your order is confirmed automatically once the payment settles on-chain — this can take a few minutes depending on the network.",
          ],
        },
        {
          heading: "Can I pay with a debit/credit card, Apple Pay, or Google Pay?",
          body: [
            "Yes — even though we settle in crypto, you can fund the payment with a card. On the payment page, note the coin, network, exact amount, and wallet address, then use a card-to-crypto service such as MoonPay, Coinbase, or Transak to buy that coin with your card, Apple Pay, or Google Pay and send it to that address (same network). Buy a little extra to cover network fees so the payment isn't short. Once it arrives, your order confirms automatically.",
            "First-time card purchases require a quick ID check with the on-ramp provider (their requirement), and on-ramp fees and minimums apply.",
          ],
        },
        {
          heading: "My payment is still “awaiting payment”",
          body: [
            "Crypto confirmations can take several minutes. The order page refreshes automatically while a payment is pending. If it hasn't updated after a while, it's safe to leave it — confirmed payments are always reconciled. For anything that looks stuck, email support with your order number.",
          ],
        },
        {
          heading: "Can I cancel an order?",
          body: [
            "An order that is still awaiting payment can be cancelled from your account before you send funds. Once a payment has been sent, contact support rather than cancelling.",
          ],
        },
        {
          heading: "Research use only",
          body: [
            "All products are sold strictly for laboratory research and development. They are not drugs, supplements, foods, or cosmetics, and are not for human or veterinary use. By ordering you certify you are a qualified researcher 21 or older.",
          ],
        },
        {
          heading: "Still have questions?",
          body: [
            "Email support@goldentrianglepeptide.com (Mon–Fri, 9am–5pm CT) with your order number and we'll help.",
          ],
        },
      ]}
    />
  );
}
