"use client";

export function ConsentSettingsButton() {
  return (
    <button
      type="button"
      className="btn-secondary"
      onClick={() => {
        try {
          window.localStorage.removeItem("gs-analytics-consent");
        } catch {
          /* ignore */
        }
        window.dispatchEvent(new Event("gs:open-consent"));
      }}
    >
      Change cookie preferences
    </button>
  );
}
