import PolicyPage from "@/components/PolicyPage";

export const metadata = {
  title: "Terms & Conditions | Golden Triangle Peptides",
};

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms & Conditions"
      updated="June 2026"
      sections={[
        {
          heading: "Research use only",
          body: [
            "All products sold by Golden Triangle Peptides are intended strictly for laboratory research and development. They are not drugs, foods, cosmetics, or supplements, and are not for human or veterinary use, including any diagnostic, therapeutic, or in-vivo application.",
          ],
        },
        {
          heading: "Eligibility",
          body: [
            "By placing an order, you certify that you are a qualified researcher at least 21 years of age and that you will handle, store, and dispose of all products in accordance with applicable laws and good laboratory practice.",
          ],
        },
        {
          heading: "Orders and pricing",
          body: [
            "We reserve the right to refuse or cancel any order, and to correct pricing or availability errors. Title and risk of loss pass to you upon delivery to the carrier.",
          ],
        },
        {
          heading: "Limitation of liability",
          body: [
            "Products are provided 'as is' for research use. To the fullest extent permitted by law, Golden Triangle Peptides is not liable for any misuse of products or for damages arising from their use outside of a controlled research setting.",
          ],
        },
      ]}
    />
  );
}
