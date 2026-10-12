"use client";

import Script from "next/script";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const CONSENT_KEY = "gs-analytics-consent";
type Consent = "granted" | "denied" | null;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function readConsent(): Consent {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

/** Fire an aggregate analytics event. No personal data is ever included. */
export function trackEvent(name: string, params: Record<string, string | number> = {}) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") window.gtag("event", name, params);
}

/**
 * Consent-gated Google Analytics 4. Renders nothing at all unless a
 * measurement ID is configured. GA only loads after the visitor opts in.
 */
export function Analytics({ measurementId }: { measurementId: string | null }) {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setConsent(readConsent());
    setReady(true);
    const reopen = () => setConsent(null);
    window.addEventListener("gs:open-consent", reopen);
    return () => window.removeEventListener("gs:open-consent", reopen);
  }, []);

  // Aggregate affiliate-click and Pinterest-share events via delegation.
  useEffect(() => {
    if (consent !== "granted") return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[data-track]") as HTMLAnchorElement | null;
      if (!a) return;
      trackEvent(a.dataset.track!, {
        item_id: a.dataset.item ?? "",
        placement: a.dataset.placement ?? "",
        page_path: window.location.pathname,
      });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [consent]);

  useEffect(() => {
    if (consent === "granted" && window.gtag && measurementId) {
      window.gtag("config", measurementId, { page_path: pathname });
    }
  }, [pathname, consent, measurementId]);

  if (!measurementId || !ready) return null;

  const decide = (value: Exclude<Consent, null>) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* storage unavailable: keep choice for this page view only */
    }
    setConsent(value);
  };

  return (
    <>
      {consent === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${measurementId}',{anonymize_ip:true,allow_google_signals:false,allow_ad_personalization_signals:false});`}
          </Script>
        </>
      )}
      {consent === null && (
        <div
          role="region"
          aria-label="Cookie consent"
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-card border border-beige bg-white p-5 text-sm shadow-soft sm:inset-x-6"
        >
          <p className="text-espresso">
            We&rsquo;d like to use optional analytics cookies to understand which guides are useful. No personal profile is built and no data is
            sold. See our{" "}
            <Link href="/cookie-policy" className="link-underline">
              cookie policy
            </Link>
            .
          </p>
          <div className="mt-4 flex gap-3">
            <button type="button" className="btn-primary !py-2" onClick={() => decide("granted")}>
              Allow analytics
            </button>
            <button type="button" className="btn-secondary !py-2" onClick={() => decide("denied")}>
              Decline
            </button>
          </div>
        </div>
      )}
    </>
  );
}
