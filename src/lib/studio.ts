import { notFound } from "next/navigation";

/**
 * The editorial studio is a read-only dashboard for local development.
 * It is unavailable in production unless explicitly enabled for a
 * protected preview deployment.
 */
export function isStudioEnabled(): boolean {
  return process.env.NODE_ENV === "development" || process.env.ENABLE_STUDIO === "true";
}

export function requireStudio() {
  if (!isStudioEnabled()) notFound();
}
