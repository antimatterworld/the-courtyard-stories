/* ————————————————————————————————————————————
   Enquiry submission — resilient by design.

   POSTs to the Cloudflare Worker endpoint (see wrangler.toml
   → `api` route). The worker forwards to a form collector and
   always returns 200. Network failure → AbortController timeout
   (10s) → one retry → graceful WhatsApp handoff fallback so the
   enquiry is NEVER lost.
   ———————————————————————————————————————————————— */

export type EnquiryPayload = {
  shootType: string;
  shootTypeLabel: string;
  dates: string;
  crewSize: string;
  crewSizeLabel: string;
  kit: string[];
  kitLabels: string[];
  budget: string;
  name: string;
  company: string;
  contact: string;
  contactType: "phone" | "email";
  notes: string;
};

export type SubmitOutcome =
  | { kind: "sent" }
  | { kind: "fallback-whatsapp"; reason: string };

const ENDPOINT = "/api/enquiry";
const TIMEOUT_MS = 10_000;

async function postOnce(payload: EnquiryPayload, signal: AbortSignal): Promise<void> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

/**
 * Submit with an 10s AbortController timeout and one retry on
 * failure. On final failure, returns a fallback result so the UI
 * can hand off to WhatsApp with the full enquiry intact.
 */
export async function submitEnquiry(payload: EnquiryPayload): Promise<SubmitOutcome> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    try {
      await postOnce(payload, controller.signal);
      return { kind: "sent" };
    } catch (firstErr) {
      // one retry — the second attempt gets its own timeout window
      const retry = new AbortController();
      setTimeout(() => retry.abort(), TIMEOUT_MS);
      try {
        await postOnce(payload, retry.signal);
        return { kind: "sent" };
      } catch (secondErr) {
        const reason =
          (secondErr instanceof DOMException && secondErr.name === "AbortError")
            ? "timed out after 2 attempts"
            : "network error on 2 attempts";
        return { kind: "fallback-whatsapp", reason };
      }
    }
  } finally {
    clearTimeout(timer);
  }
}

/* — form-field validation — */

export type FieldErrors = Partial<Record<string, string>>;

export function validateContactStep(v: {
  name: string;
  contact: string;
  contactType: "phone" | "email";
}): FieldErrors {
  const e: FieldErrors = {};
  if (v.name.trim().length < 2) e.name = "Please tell us your name.";
  if (v.contactType === "email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.contact.trim()))
      e.contact = "That email doesn't look right — check the format.";
  } else {
    const digits = v.contact.replace(/\D/g, "");
    if (digits.length < 10) e.contact = "A phone number we can call back on.";
  }
  return e;
}

export function buildWhatsAppEnquiry(p: EnquiryPayload): string {
  const kit = p.kitLabels.length ? p.kitLabels.join(", ") : "Standard crew";
  return [
    `Hi The Courtyard Stories — I'd like to book a shoot.`,
    ``,
    `• Type: ${p.shootTypeLabel}`,
    `• Tentative date: ${p.dates || "flexible"}`,
    `• Crew size: ${p.crewSizeLabel}`,
    `• Kit/crew needed: ${kit}`,
    p.budget ? `• Budget range: ${p.budget}` : ``,
    `• Name: ${p.name} — ${p.company ? `(${p.company})` : ``}`,
    `• Reach me: ${p.contact} (${p.contactType})`,
    p.notes ? `• Notes: ${p.notes}` : ``,
  ]
    .filter(Boolean)
    .join("\n");
}
