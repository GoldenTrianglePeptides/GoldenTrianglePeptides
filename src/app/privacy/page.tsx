import PolicyPage from "@/components/PolicyPage";

export const metadata = { title: "Privacy Policy | Golden Triangle Peptides" };

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      updated="June 2026"
      sections={[
        {
          heading: "Information we collect",
          body: [
            "We collect the information you provide when you create an account, place an order, or contact support — such as your name, email address, and shipping details. We also collect basic order history so you can review past purchases.",
          ],
        },
        {
          heading: "How we use your information",
          body: [
            "Your information is used to process and ship orders, provide customer support, maintain your account, and send order-related communications. We do not sell your personal information.",
          ],
        },
        {
          heading: "Data security",
          body: [
            "Account passwords are stored using one-way hashing, and sessions are protected with signed, httpOnly cookies. We take reasonable measures to protect your data, though no method of transmission over the internet is completely secure.",
          ],
        },
        {
          heading: "Contact",
          body: [
            "Questions about this policy can be sent to support@goldentrianglepeptide.com.",
          ],
        },
      ]}
    />
  );
}
