// Resolves a product to its custom vial image by matching keywords in the
// product name, so the right labeled vial shows in the corner on the storefront.
// Falls back to the provided image (or the generic vial) when there's no match.

const VIAL_BY_KEYWORD: { match: RegExp; file: string }[] = [
  { match: /retatrutide/i, file: "vial-retatrutide.png" },
  { match: /semaglutide/i, file: "vial-semaglutide.png" },
  { match: /tirzepatide/i, file: "vial-tirzepatide.png" },
  { match: /tesamorelin/i, file: "vial-tesamorelin.png" },
  { match: /selank/i, file: "vial-selank.png" },
  { match: /semax/i, file: "vial-semax.png" },
  { match: /igf/i, file: "vial-igf-1-lr3.png" },
  { match: /mots/i, file: "vial-mots-c.png" },
  { match: /ghk/i, file: "vial-ghk-cu.png" },
  { match: /bpc/i, file: "vial-bpc-157.png" },
  { match: /klow/i, file: "vial-klow-blend.png" },
  { match: /(tb-?500|thymosin\s*beta)/i, file: "vial-tb-500.png" },
  { match: /(cjc|ipamorelin)/i, file: "vial-cjc-1295-ipamorelin.png" },
  { match: /(bacteriostatic|water)/i, file: "vial-bacteriostatic-water.png" },
];

/**
 * The vial image path for a product. `fallback` is used when no custom vial
 * matches (e.g. the product's own imageUrl, which itself defaults to the
 * generic /products/vial.png).
 */
export function vialImageFor(name: string, fallback: string): string {
  for (const { match, file } of VIAL_BY_KEYWORD) {
    if (match.test(name)) return `/products/${file}`;
  }
  return fallback;
}
