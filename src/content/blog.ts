// Blog content as code: renders statically, deploys with the app, and needs no
// database or seed. Add new articles by appending to POSTS. Bodies are trusted
// HTML authored here (not user input), so they're safe to render directly.
//
// All content is educational and framed for laboratory research use only — it
// makes no medical, dosing, or human-use claims.

export type BlogPost = {
  slug: string;
  title: string;
  description: string; // meta description / list excerpt
  date: string; // ISO yyyy-mm-dd
  readingMinutes: number;
  /** Trusted HTML body. */
  html: string;
};

const RUO = `<p class="ruo-note"><strong>Research use only.</strong> This article is educational and intended for qualified researchers. The compounds discussed are sold strictly for in-vitro laboratory research and are not drugs, supplements, or for human or veterinary use.</p>`;

export const POSTS: BlogPost[] = [
  {
    slug: "what-is-bpc-157",
    title: "What Is BPC-157? A Research Overview",
    description:
      "An educational overview of BPC-157, a synthetic peptide widely studied in preclinical research. Structure, background, and handling notes for the lab.",
    date: "2026-06-22",
    readingMinutes: 4,
    html: `
      <p>BPC-157 (Body Protection Compound-157) is a synthetic 15-amino-acid peptide derived from a sequence identified in gastric juice. It is one of the most frequently referenced peptides in preclinical literature, where it is studied for its effects in tissue and cellular models.</p>
      <h2>Background</h2>
      <p>BPC-157 is a stable peptide fragment that has been the subject of numerous animal and in-vitro studies exploring angiogenesis, fibroblast activity, and tissue-repair pathways. As a research compound it is typically supplied as a lyophilized (freeze-dried) powder.</p>
      <h2>Common research forms</h2>
      <ul>
        <li>Lyophilized powder in sealed vials (commonly 5&nbsp;mg, 10&nbsp;mg, 20&nbsp;mg)</li>
        <li>Reconstituted with bacteriostatic water for in-vitro work</li>
      </ul>
      <h2>Handling &amp; storage</h2>
      <p>Lyophilized BPC-157 is generally stored at −20&nbsp;°C and protected from light. After reconstitution it is kept refrigerated and used within a short window. Always confirm purity via a Certificate of Analysis (HPLC) before use.</p>
      ${RUO}
    `,
  },
  {
    slug: "retatrutide-glp-3-explained",
    title: "Retatrutide (GLP-3) Explained for Researchers",
    description:
      "What retatrutide is, how it differs from single- and dual-agonist peptides, and lab handling notes. Educational, research-use-only overview.",
    date: "2026-06-20",
    readingMinutes: 5,
    html: `
      <p>Retatrutide is an investigational triple-receptor agonist peptide studied in metabolic research. It is sometimes informally grouped with the "GLP" research peptides alongside semaglutide and tirzepatide.</p>
      <h2>How it differs</h2>
      <p>Where semaglutide acts on a single incretin receptor pathway and tirzepatide on two, retatrutide is studied as a triple agonist. This makes it a frequent point of comparison in receptor-pharmacology research.</p>
      <h2>Research forms</h2>
      <ul>
        <li>Lyophilized powder, commonly supplied in 10–40&nbsp;mg vials</li>
        <li>Reconstituted with bacteriostatic water for in-vitro assays</li>
      </ul>
      <h2>Purity matters</h2>
      <p>Because peptide research depends on consistent inputs, verify each lot's identity and purity (typically ≥99% by HPLC) against its Certificate of Analysis before designing experiments.</p>
      ${RUO}
    `,
  },
  {
    slug: "semaglutide-vs-tirzepatide",
    title: "Semaglutide vs. Tirzepatide: Key Research Differences",
    description:
      "A side-by-side educational comparison of two of the most studied metabolic research peptides — mechanism class, structure, and lab considerations.",
    date: "2026-06-18",
    readingMinutes: 5,
    html: `
      <p>Semaglutide and tirzepatide are two of the most widely studied metabolic research peptides. Researchers often compare them when modeling incretin-receptor pathways in vitro.</p>
      <h2>At a glance</h2>
      <ul>
        <li><strong>Semaglutide</strong> — studied as a single-receptor agonist.</li>
        <li><strong>Tirzepatide</strong> — studied as a dual-receptor agonist.</li>
      </ul>
      <p>This difference in receptor activity is the main reason the two are frequently used as comparators in the same research program.</p>
      <h2>Lab considerations</h2>
      <p>Both are supplied as lyophilized powders and reconstituted with bacteriostatic water. Storage at −20&nbsp;°C for the lyophilized form is typical. Confirm purity by HPLC before use, and keep reconstitution volumes consistent across an experiment for comparable results.</p>
      ${RUO}
    `,
  },
  {
    slug: "how-to-reconstitute-research-peptides",
    title: "How to Reconstitute Research Peptides",
    description:
      "A general lab guide to reconstituting lyophilized research peptides with bacteriostatic water — technique, volume, and storage best practices.",
    date: "2026-06-15",
    readingMinutes: 4,
    html: `
      <p>Most research peptides ship as a lyophilized (freeze-dried) powder that must be reconstituted before in-vitro use. This is a general educational overview of the technique used in laboratory settings.</p>
      <h2>What you need</h2>
      <ul>
        <li>The lyophilized peptide vial</li>
        <li>Bacteriostatic water (the typical diluent)</li>
        <li>A sterile syringe</li>
      </ul>
      <h2>General technique</h2>
      <ol>
        <li>Let the vial reach room temperature.</li>
        <li>Draw the chosen volume of bacteriostatic water.</li>
        <li>Add it slowly down the inside wall of the vial — do not spray directly onto the powder.</li>
        <li>Let the powder dissolve on its own; swirl gently if needed. Do not shake.</li>
      </ol>
      <h2>Storage after reconstitution</h2>
      <p>Reconstituted peptides are generally refrigerated (2–8&nbsp;°C), protected from light, and used within a limited window. Label the vial with the reconstitution date and concentration.</p>
      ${RUO}
    `,
  },
  {
    slug: "reading-a-certificate-of-analysis",
    title: "Reading a Certificate of Analysis: Purity &amp; HPLC",
    description:
      "How to read a peptide Certificate of Analysis (COA) — HPLC purity, mass spec identity, and why third-party testing matters for research integrity.",
    date: "2026-06-12",
    readingMinutes: 4,
    html: `
      <p>A Certificate of Analysis (COA) is the document that tells you what's actually in a research vial. Knowing how to read one is essential for reproducible work.</p>
      <h2>What to look for</h2>
      <ul>
        <li><strong>HPLC purity</strong> — usually expressed as a percentage (e.g. ≥99%). Higher purity means fewer process-related impurities.</li>
        <li><strong>Mass spectrometry</strong> — confirms the peptide's identity by molecular weight.</li>
        <li><strong>Lot/batch number</strong> — ties the COA to the specific vial you received.</li>
      </ul>
      <h2>Why third-party testing matters</h2>
      <p>Independent, third-party verification reduces the risk of mislabeled or low-purity material skewing your results. Always match the COA's lot number to the vial in hand.</p>
      ${RUO}
    `,
  },
  {
    slug: "storing-research-peptides",
    title: "Storing Research Peptides Properly",
    description:
      "Temperature, light, and timing best practices for storing lyophilized and reconstituted research peptides to preserve integrity.",
    date: "2026-06-10",
    readingMinutes: 3,
    html: `
      <p>Peptides are sensitive molecules. Proper storage preserves their integrity and keeps research results consistent.</p>
      <h2>Lyophilized (powder)</h2>
      <ul>
        <li>Store at −20&nbsp;°C (long-term) and protect from light and moisture.</li>
        <li>Keep vials sealed until use.</li>
      </ul>
      <h2>Reconstituted (liquid)</h2>
      <ul>
        <li>Refrigerate at 2–8&nbsp;°C.</li>
        <li>Protect from light; avoid repeated temperature swings.</li>
        <li>Use within the recommended window and label with the reconstitution date.</li>
      </ul>
      ${RUO}
    `,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
