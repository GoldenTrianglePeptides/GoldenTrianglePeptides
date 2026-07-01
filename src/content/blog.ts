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
  {
    slug: "what-is-tb-500",
    title: "What Is TB-500 (Thymosin Beta-4)?",
    description:
      "An educational overview of TB-500, a synthetic fragment related to Thymosin Beta-4, widely studied in tissue-repair and cell-migration research.",
    date: "2026-06-28",
    readingMinutes: 4,
    html: `
      <p>TB-500 is a synthetic peptide based on a region of Thymosin Beta-4 (TΒ4), a naturally occurring protein involved in actin regulation. It is a common subject in preclinical research on cell migration, angiogenesis, and tissue repair.</p>
      <h2>Background</h2>
      <p>Thymosin Beta-4 is one of the most abundant actin-binding proteins in many cell types. TB-500 refers to the active fragment most often used in research, supplied as a lyophilized powder.</p>
      <h2>Research forms</h2>
      <ul>
        <li>Lyophilized powder, commonly 5–20&nbsp;mg vials</li>
        <li>Reconstituted with bacteriostatic water for in-vitro work — see our <a href="/calculator">reconstitution calculator</a></li>
      </ul>
      <h2>Handling</h2>
      <p>Store lyophilized at −20&nbsp;°C, protected from light; refrigerate after reconstitution. Confirm identity and purity (HPLC) against the lot's Certificate of Analysis. Browse tested material on our <a href="/products">products page</a>.</p>
      ${RUO}
    `,
  },
  {
    slug: "semax-and-selank",
    title: "Semax & Selank: The Nootropic Research Peptides",
    description:
      "What Semax and Selank are, how they differ, and why these two peptides are frequently studied together in cognitive and behavioral research models.",
    date: "2026-06-27",
    readingMinutes: 4,
    html: `
      <p>Semax and Selank are two synthetic peptides originally developed in Russia and frequently grouped together as "nootropic" research peptides. Both are studied in cognitive- and behavioral-research models.</p>
      <h2>Semax</h2>
      <p>Semax is a short peptide derived from a fragment of ACTH (adrenocorticotropic hormone). It is studied for its effects on neurotrophic signaling pathways in research settings.</p>
      <h2>Selank</h2>
      <p>Selank is a synthetic analog of the immunomodulatory peptide tuftsin. It is frequently studied alongside Semax in anxiety- and stress-pathway research.</p>
      <h2>Research forms</h2>
      <ul>
        <li>Lyophilized powder (commonly 10&nbsp;mg vials)</li>
        <li>Some variants are amidated (e.g. "NA Selank Amidate") for added stability</li>
      </ul>
      ${RUO}
    `,
  },
  {
    slug: "what-is-ghk-cu",
    title: "What Is GHK-Cu (Copper Peptide)?",
    description:
      "An overview of GHK-Cu, a naturally occurring copper-binding tripeptide widely studied in skin, collagen, and wound-healing research.",
    date: "2026-06-26",
    readingMinutes: 3,
    html: `
      <p>GHK-Cu is a copper-binding tripeptide (glycyl-L-histidyl-L-lysine complexed with copper) that occurs naturally in plasma. It is one of the most-studied peptides in skin, collagen, and tissue-remodeling research.</p>
      <h2>Why it's studied</h2>
      <p>Research literature explores GHK-Cu's role in extracellular-matrix remodeling and its copper-delivery properties in cellular models.</p>
      <h2>Research forms</h2>
      <ul>
        <li>Lyophilized powder, commonly 50–200&nbsp;mg vials</li>
        <li>Used in both reconstituted and topical research preparations</li>
      </ul>
      <p>As with any research peptide, verify purity by HPLC before use.</p>
      ${RUO}
    `,
  },
  {
    slug: "cjc-1295-and-ipamorelin",
    title: "CJC-1295 & Ipamorelin: A Research Overview",
    description:
      "What CJC-1295 and Ipamorelin are, the difference between CJC-1295 with and without DAC, and why the two are often studied as a pair.",
    date: "2026-06-25",
    readingMinutes: 5,
    html: `
      <p>CJC-1295 and Ipamorelin are two growth-hormone–secretagogue research peptides that are frequently studied together because they act on complementary pathways in preclinical models.</p>
      <h2>CJC-1295</h2>
      <p>CJC-1295 is a synthetic analog of growth-hormone-releasing hormone (GHRH). It is available in two research forms: <strong>with DAC</strong> (Drug Affinity Complex, longer-acting) and <strong>without DAC</strong> ("No DAC", also called Mod GRF 1-29, shorter-acting).</p>
      <h2>Ipamorelin</h2>
      <p>Ipamorelin is a selective ghrelin-receptor agonist (a GHRP). It is studied for its selectivity in receptor-pharmacology research.</p>
      <h2>Why pair them</h2>
      <p>Because the two act on different receptors, they are common comparators and combinations in the same research program (e.g. the "CJC-1295 (No DAC) + Ipamorelin" blend). See available blends on our <a href="/products">products page</a>.</p>
      ${RUO}
    `,
  },
  {
    slug: "what-is-mots-c",
    title: "What Is MOTS-c?",
    description:
      "An educational overview of MOTS-c, a mitochondrial-derived peptide studied in metabolic and exercise-physiology research.",
    date: "2026-06-24",
    readingMinutes: 3,
    html: `
      <p>MOTS-c is a mitochondrial-derived peptide (MDP) — a small peptide encoded within mitochondrial DNA. It is studied in metabolic-research and exercise-physiology models.</p>
      <h2>Why it's studied</h2>
      <p>Research explores MOTS-c's role in cellular metabolic regulation and mitochondrial signaling. As a research compound it is supplied as a lyophilized powder.</p>
      <h2>Research forms</h2>
      <ul>
        <li>Lyophilized powder, commonly 10–20&nbsp;mg vials</li>
        <li>Reconstituted with bacteriostatic water — see the <a href="/calculator">calculator</a></li>
      </ul>
      ${RUO}
    `,
  },
  {
    slug: "what-is-tesamorelin",
    title: "What Is Tesamorelin?",
    description:
      "An overview of Tesamorelin, a stabilized GHRH analog studied in metabolic and adipose-tissue research.",
    date: "2026-06-23",
    readingMinutes: 3,
    html: `
      <p>Tesamorelin is a synthetic, stabilized analog of growth-hormone-releasing hormone (GHRH). It is studied in metabolic and adipose-tissue research models.</p>
      <h2>Background</h2>
      <p>As a GHRH analog, Tesamorelin is frequently compared with other growth-hormone–axis research peptides such as CJC-1295. It is supplied as a lyophilized powder.</p>
      <h2>Handling</h2>
      <p>Store lyophilized at −20&nbsp;°C; reconstitute with bacteriostatic water and refrigerate. Verify purity by HPLC before use.</p>
      ${RUO}
    `,
  },
  {
    slug: "what-is-igf-1-lr3",
    title: "What Is IGF-1 LR3?",
    description:
      "An overview of IGF-1 LR3 (Long R3 IGF-1), a long-acting insulin-like growth factor analog widely used in cell-culture research.",
    date: "2026-06-21",
    readingMinutes: 4,
    html: `
      <p>IGF-1 LR3 (Long R3 Insulin-like Growth Factor-1) is a synthetic analog of IGF-1 engineered for greater potency and a longer half-life. It is a common supplement in cell-culture and growth-factor research.</p>
      <h2>Why "LR3"</h2>
      <p>The "Long R3" modification adds an N-terminal extension and a single amino-acid substitution that reduce binding to IGF-binding proteins, increasing activity in culture compared with native IGF-1.</p>
      <h2>Research forms</h2>
      <ul>
        <li>Lyophilized powder, commonly supplied as 1&nbsp;mg single vials</li>
        <li>Reconstituted for in-vitro assays</li>
      </ul>
      <p>Because LR3 is potent at low concentrations, careful reconstitution math matters — use the <a href="/calculator">calculator</a>.</p>
      ${RUO}
    `,
  },
  {
    slug: "bacteriostatic-water-explained",
    title: "Bacteriostatic Water vs. Sterile Water: What to Use",
    description:
      "The difference between bacteriostatic and sterile water for reconstituting research peptides, why benzyl alcohol matters, and how much to add.",
    date: "2026-06-19",
    readingMinutes: 4,
    html: `
      <p>Reconstituting a lyophilized peptide starts with choosing a diluent. The two most common are bacteriostatic water and sterile water — they are not interchangeable for multi-use research vials.</p>
      <h2>The difference</h2>
      <ul>
        <li><strong>Bacteriostatic water</strong> contains ~0.9% benzyl alcohol, which inhibits bacterial growth. This makes a reconstituted vial suitable for repeated draws over a research window.</li>
        <li><strong>Sterile water</strong> has no preservative — once opened it is single-use.</li>
      </ul>
      <p>For multi-draw research vials, bacteriostatic water is the standard choice.</p>
      <h2>How much to add</h2>
      <p>There's no single "correct" volume — it sets the concentration. More water = lower concentration; less water = higher concentration. Use our <a href="/calculator">reconstitution calculator</a> to work out the resulting concentration for a given volume, and see <a href="/blog/how-to-reconstitute-research-peptides">how to reconstitute</a> for technique.</p>
      ${RUO}
    `,
  },
  {
    slug: "glp-1-glp-2-glp-3-explained",
    title: "GLP-1, GLP-2, GLP-3: What the Names Mean",
    description:
      "A plain-English explainer of the GLP-1 / GLP-2 / GLP-3 labels used for semaglutide, tirzepatide, and retatrutide — single, dual, and triple receptor agonists.",
    date: "2026-06-17",
    readingMinutes: 4,
    html: `
      <p>You'll often see metabolic research peptides labeled "GLP-1," "GLP-2," or "GLP-3." These shorthand labels describe how many incretin receptors the molecule is studied to act on.</p>
      <h2>The shorthand</h2>
      <ul>
        <li><strong>GLP-1 — Semaglutide:</strong> studied as a single-receptor agonist.</li>
        <li><strong>GLP-2 — Tirzepatide:</strong> studied as a dual-receptor agonist.</li>
        <li><strong>GLP-3 — Retatrutide:</strong> studied as a triple-receptor agonist.</li>
      </ul>
      <p>Note: this 1/2/3 naming is an informal product shorthand for single/dual/triple activity — it is not the formal pharmacological nomenclature.</p>
      <h2>Going deeper</h2>
      <p>For a side-by-side, see <a href="/blog/semaglutide-vs-tirzepatide">Semaglutide vs. Tirzepatide</a> and <a href="/blog/retatrutide-glp-3-explained">Retatrutide (GLP-3) Explained</a>. Browse tested material on our <a href="/products">products page</a>.</p>
      ${RUO}
    `,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
