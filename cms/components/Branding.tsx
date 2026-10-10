// Admin branding: shown on the login screen (Logo) and in the nav (Icon).
// Replace the wordmark with the official SVG logo once supplied.

export function AdminLogo() {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", lineHeight: 1 }}>
      <span style={{ fontFamily: "Georgia, serif", fontSize: "1.6rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
        Transition
      </span>
      <span style={{ fontWeight: 700, fontSize: "1.4rem", letterSpacing: "0.1em", color: "#0ed5c2" }}>VC</span>
    </div>
  );
}

export function AdminIcon() {
  return (
    <span
      aria-label="Transition VC"
      style={{ fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.06em", color: "#0ed5c2" }}
    >
      TVC
    </span>
  );
}
