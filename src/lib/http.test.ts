import { beforeEach, describe, expect, it } from "vitest";
import { isSameOrigin } from "./http";

function req(headers: Record<string, string>): Request {
  return new Request("https://goldentrianglepeptide.com/api/x", {
    method: "POST",
    headers,
  });
}

describe("isSameOrigin", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://goldentrianglepeptide.com";
  });

  it("allows same-origin via Sec-Fetch-Site", () => {
    expect(isSameOrigin(req({ "sec-fetch-site": "same-origin" }))).toBe(true);
  });

  it("allows user-initiated (Sec-Fetch-Site: none)", () => {
    expect(isSameOrigin(req({ "sec-fetch-site": "none" }))).toBe(true);
  });

  it("rejects cross-site via Sec-Fetch-Site", () => {
    expect(isSameOrigin(req({ "sec-fetch-site": "cross-site" }))).toBe(false);
  });

  it("allows a matching Origin when Sec-Fetch-Site is absent", () => {
    expect(
      isSameOrigin(req({ origin: "https://goldentrianglepeptide.com" })),
    ).toBe(true);
  });

  it("rejects a foreign Origin", () => {
    expect(isSameOrigin(req({ origin: "https://evil.example" }))).toBe(false);
  });

  it("allows when neither header is present (no forgeable cross-site form)", () => {
    expect(isSameOrigin(req({}))).toBe(true);
  });
});
