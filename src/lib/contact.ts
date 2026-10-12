import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(200),
  topic: z.enum(["general", "correction", "partnership", "privacy"]).default("general"),
  message: z.string().trim().min(10, "Please write a little more").max(5000),
  // Honeypot: real visitors never see or fill this field.
  website: z.string().max(0).optional().default(""),
  // Time trap: forms submitted faster than a human could type are rejected.
  startedAt: z.coerce.number().int().positive(),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const MIN_FILL_MS = 3000;

/** Best-effort in-memory rate limiter (per server instance). */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string, now = Date.now()): boolean => {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) hits.clear();
    return true;
  };
}

export function isContactDeliveryConfigured(): boolean {
  return (
    process.env.CONTACT_PROVIDER === "resend" &&
    Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_FROM_EMAIL && process.env.CONTACT_TO_EMAIL)
  );
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Send via Resend's HTTP API. Server-side only; the key never reaches the browser. */
export async function deliverContact(input: ContactInput): Promise<boolean> {
  if (!isContactDeliveryConfigured()) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL,
      to: [process.env.CONTACT_TO_EMAIL],
      reply_to: input.email,
      subject: `[The Gilded Skin] ${input.topic}: message from ${input.name}`,
      text: `Name: ${input.name}\nEmail: ${input.email}\nTopic: ${input.topic}\n\n${input.message}`,
      html: `<p><strong>Name:</strong> ${escape(input.name)}<br><strong>Email:</strong> ${escape(input.email)}<br><strong>Topic:</strong> ${escape(
        input.topic,
      )}</p><p>${escape(input.message).replace(/\n/g, "<br>")}</p>`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  return res.ok;
}
