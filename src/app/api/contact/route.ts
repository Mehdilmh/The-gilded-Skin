import { NextResponse } from "next/server";
import { contactSchema, createRateLimiter, deliverContact, isContactDeliveryConfigured, MIN_FILL_MS } from "@/lib/contact";

const limiter = createRateLimiter(5, 60 * 60 * 1000);

function back(request: Request, status: string) {
  return NextResponse.redirect(new URL(`/contact?status=${status}#contact-form`, request.url), 303);
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  if (!limiter(ip)) return back(request, "rate-limited");

  let data: Record<string, FormDataEntryValue>;
  try {
    data = Object.fromEntries(await request.formData());
  } catch {
    return back(request, "invalid");
  }
  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) return back(request, "invalid");

  // Spam signals: pretend success so bots learn nothing.
  if (parsed.data.website || Date.now() - parsed.data.startedAt < MIN_FILL_MS) return back(request, "sent");

  if (!isContactDeliveryConfigured()) return back(request, "unavailable");
  try {
    const ok = await deliverContact(parsed.data);
    return back(request, ok ? "sent" : "error");
  } catch {
    // Never echo provider errors to the visitor.
    return back(request, "error");
  }
}

export function GET(request: Request) {
  return NextResponse.redirect(new URL("/contact", request.url), 303);
}
