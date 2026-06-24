export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/** Carriers we can build a tracking link for. */
export const SHIPPING_CARRIERS = ["USPS", "UPS", "FedEx", "DHL", "Other"] as const;

/**
 * Build a public tracking URL for a known carrier, or null if we can't
 * (unknown carrier, "Other", or no tracking number).
 */
export function carrierTrackingUrl(
  carrier: string | null | undefined,
  trackingNumber: string | null | undefined,
): string | null {
  if (!carrier || !trackingNumber) return null;
  const n = encodeURIComponent(trackingNumber.trim());
  switch (carrier.toLowerCase()) {
    case "usps":
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`;
    case "ups":
      return `https://www.ups.com/track?tracknum=${n}`;
    case "fedex":
      return `https://www.fedex.com/fedextrack/?trknbr=${n}`;
    case "dhl":
      return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${n}`;
    default:
      return null;
  }
}
