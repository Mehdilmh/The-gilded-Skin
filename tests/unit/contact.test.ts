import { describe, expect, it } from "vitest";
import { contactSchema, createRateLimiter } from "@/lib/contact";
import { searchArticles } from "@/lib/search";
import { getPublishedArticles } from "@/lib/content";

describe("contact form validation", () => {
  const valid = { name: "Ada", email: "ada@example.com", message: "Hello there, a question about a guide.", startedAt: "1700000000000" };
  it("accepts valid input", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects invalid email, short message and filled honeypot", () => {
    expect(contactSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, message: "hi" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, website: "http://spam" }).success).toBe(false);
  });
});

describe("rate limiter", () => {
  it("limits requests per key within the window", () => {
    const limit = createRateLimiter(2, 1000);
    expect(limit("a", 0)).toBe(true);
    expect(limit("a", 1)).toBe(true);
    expect(limit("a", 2)).toBe(false);
    expect(limit("b", 2)).toBe(true);
    expect(limit("a", 2000)).toBe(true);
  });
});

describe("search", () => {
  it("finds published articles by keyword", () => {
    const results = searchArticles(getPublishedArticles(), "gua sha");
    expect(results[0]?.slug).toBe("facial-rollers-vs-gua-sha");
  });
  it("returns nothing for empty queries", () => {
    expect(searchArticles(getPublishedArticles(), "  ")).toEqual([]);
  });
});
