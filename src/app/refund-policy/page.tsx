import PolicyPage from "@/components/PolicyPage";

export const metadata = { title: "Refund Policy | Golden Triangle Peptides" };

export default function RefundPolicyPage() {
  return (
    <PolicyPage
      title="Refund Policy"
      updated="June 2026"
      sections={[
        {
          heading: "Damaged or incorrect items",
          body: [
            "If your order arrives damaged, or you received the wrong item, contact us within 7 days of delivery with your order number and a photo where applicable. We will arrange a replacement or refund for the affected items.",
          ],
        },
        {
          heading: "Unopened products",
          body: [
            "Because these are research materials, we can only consider returns of unopened, undamaged items with intact seals. Reconstituted or opened vials cannot be returned for safety and integrity reasons.",
          ],
        },
        {
          heading: "Processing",
          body: [
            "Approved refunds are issued to the original payment method. Please allow several business days for the refund to appear after it is processed.",
          ],
        },
        {
          heading: "Contact",
          body: [
            "To start a request, email support@goldentrianglepeptide.com with your order number.",
          ],
        },
      ]}
    />
  );
}
