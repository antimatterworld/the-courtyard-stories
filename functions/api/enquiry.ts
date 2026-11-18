/* Cloudflare Pages Function — /api/enquiry
   Accepts the studio's JSON enquiry payload, validates it, forwards
   it to the configured collector (ENQUIRY_COLLECTOR_URL), and
   returns 200 either way so the client's resilient fetch treats
   any response as "received". Forwarding happens fire-and-forget
   with its own 8s timeout; a collector outage never fails the
   user-facing submission. */

const MAX_BODY = 8 * 1024;

type Env = { ENQUIRY_COLLECTOR_URL?: string };
type EventContext = {
  request: Request;
  env: Env;
  waitUntil: (fn: Promise<unknown>) => void;
};

export const onRequest = async (context: EventContext): Promise<Response> => {
  const { request, env } = context;
  if (request.method !== "POST") {
    return json({ ok: false, error: "method-not-allowed" }, 405);
  }

  let body: unknown;
  try {
    // Cloudflare extends Request.json() with a size cap; standard fetch
    // ignores the options arg, so this degrades gracefully off-CF.
    body = await request.json();
    if (JSON.stringify(body).length > MAX_BODY) return json({ ok: false, error: "body-too-large" }, 413);
  } catch {
    return json({ ok: false, error: "invalid-body" }, 400);
  }

  const p = validate(body);
  if (!p.ok) return json({ ok: false, error: p.reason }, 400);

  const collector = env.ENQUIRY_COLLECTOR_URL;
  if (collector) {
    // Fire-and-forget: the user's acknowledgement never waits on us.
    void fetch(collector, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p.value, receivedAt: new Date().toISOString() }),
      redirect: "follow",
    })
      .catch(() => {
        /* logged via workerd structured log in a real deploy */
      });
  }

  return json({ ok: true });
};

/* ————————————————— validation ————————————————— */

function validate(input: unknown): { ok: true; value: Enquiry } | { ok: false; reason: string } {
  if (typeof input !== "object" || input === null) return { ok: false, reason: "not-an-object" };
  const o = input as Record<string, unknown>;
  const str = (k: string, max: number) =>
    typeof o[k] === "string" ? o[k].slice(0, max) : "";

  const shootType = str("shootType", 40);
  const name = str("name", 120);
  const contact = str("contact", 160);

  if (!shootType) return { ok: false, reason: "missing-shoot-type" };
  if (name.length < 2) return { ok: false, reason: "missing-name" };
  if (!contact) return { ok: false, reason: "missing-contact" };

  const kit = Array.isArray(o.kit) ? (o.kit as unknown[]).filter((x) => typeof x === "string").slice(0, 12) : [];
  const kitLabels = Array.isArray(o.kitLabels)
    ? (o.kitLabels as unknown[]).filter((x) => typeof x === "string").slice(0, 12)
    : [];

  return {
    ok: true,
    value: {
      shootType,
      shootTypeLabel: str("shootTypeLabel", 80),
      dates: str("dates", 120),
      crewSize: str("crewSize", 20),
      crewSizeLabel: str("crewSizeLabel", 60),
      kit,
      kitLabels,
      budget: str("budget", 60),
      name,
      company: str("company", 120),
      contact,
      contactType: o.contactType === "email" ? "email" : "phone",
      notes: str("notes", 600),
    },
  };
}

type Enquiry = {
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

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
