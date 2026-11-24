import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CREW_SIZES,
  ENQUIRY_STEPS,
  KIT_NEEDS,
  SHOOT_TYPES,
  waLink,
} from "../data/content";
import {
  buildWhatsAppEnquiry,
  submitEnquiry,
  validateContactStep,
  type EnquiryPayload,
  type FieldErrors,
} from "../lib/submission";

/* ————————————————————————————————————————————
   Multi-step conditional enquiry.

   Step 1 (shoot type) drives what step 2 asks:
   · Fashion / Commercial / Product → date + budget fields
   · Podcast → episode count instead of crew size
   · Space only → booking-block picker instead of dates
   · Other → free-text brief
   Step 3 hides kit options that don't apply to "Space only".
   Step 4 validates contact; submit → resilient fetch →
   WhatsApp fallback so the enquiry is never lost.
   ———————————————————————————————————————————————— */

type Prefill = { type?: string; date?: string; notes?: string };

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "sent"; note: string }
  | { state: "fallback"; reason: string };

export function EnquiryForm({ initial }: { initial?: Prefill }) {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [errors, setErrors] = useState<FieldErrors>({});

  const [form, setForm] = useState({
    shootType: SHOOT_TYPES.some((s) => s.key === initial?.type) ? (initial?.type ?? "") : "",
    dates: initial?.date ?? "",
    episodeCount: "2",
    spaceBlock: "4h",
    crewSize: "",
    kit: [] as string[],
    budget: "",
    name: "",
    company: "",
    contact: "",
    contactType: "phone" as "phone" | "email",
    notes: initial?.notes ?? "",
  });

  const isSpaceOnly = form.shootType === "space" || form.shootType === "studio";
  const isPodcast = form.shootType === "podcast";
  const isOther = form.shootType === "other";

  const shootTypeLabel = useMemo(
    () => SHOOT_TYPES.find((s) => s.key === form.shootType)?.label ?? "—",
    [form.shootType],
  );
  const crewSizeLabel = useMemo(
    () => CREW_SIZES.find((c) => c.key === form.crewSize)?.label ?? "—",
    [form.crewSize],
  );
  const kitLabels = useMemo(
    () => KIT_NEEDS.filter((k) => form.kit.includes(k.key)).map((k) => k.label),
    [form.kit],
  );
  const waMsg = useMemo(
    () =>
      waLink(
        `Hi — I'm planning a ${shootTypeLabel.toLowerCase()} with The Courtyard Stories.`,
      ),
    [shootTypeLabel],
  );

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    // clear that field's error the moment it's edited
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggleKit = (k: string) =>
    setForm((f) => ({
      ...f,
      kit: f.kit.includes(k) ? f.kit.filter((x) => x !== k) : [...f.kit, k],
    }));

  const step2Valid = () => {
    if (isSpaceOnly) return true;
    if (isOther) return true;
    return form.dates.trim().length > 0;
  };

  const step3Valid = () => {
    if (isSpaceOnly || isOther) return true;
    return form.crewSize !== "";
  };

  const payload = (): EnquiryPayload => ({
    shootType: form.shootType,
    shootTypeLabel,
    dates: isSpaceOnly ? `${form.spaceBlock} block (space only)` : isOther ? form.notes || "flexible" : form.dates,
    crewSize: isSpaceOnly ? "—" : form.crewSize,
    crewSizeLabel: isSpaceOnly ? "Space only" : crewSizeLabel,
    kit: form.kit,
    kitLabels,
    budget: form.budget,
    name: form.name,
    company: form.company,
    contact: form.contact,
    contactType: form.contactType,
    notes: form.notes,
  });

  const next = () => {
    if (step === 0 && !form.shootType) {
      setErrors({ shootType: "Pick the kind of shoot you have in mind." });
      return;
    }
    if (step === 0) setErrors({});
    if (step === 1 && !step2Valid()) {
      setErrors({ dates: "A rough date — or 'flexible' — is enough, just tell us." });
      return;
    }
    if (step === 2 && !step3Valid()) {
      setErrors({ crewSize: "How many people will be on set?" });
      return;
    }
    if (step === 3) {
      const e = validateContactStep(form);
      setErrors(e);
      if (Object.keys(e).length === 0) void submit();
      return;
    }
    setStep((s) => s + 1);
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  const submit = async () => {
    setStatus({ state: "sending" });
    const outcome = await submitEnquiry(payload());
    if (outcome.kind === "sent") {
      setStatus({ state: "sent", note: "Enquiry received — we reply within one working day." });
    } else {
      setStatus({ state: "fallback", reason: outcome.reason });
    }
  };

  /* ————— sent ————— */
  if (status.state === "sent") {
    return (
      <div className="card" style={{ padding: "var(--s-6)" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <span style={{ fontSize: "1.4rem", lineHeight: 1.2 }}>✓</span>
          <div>
            <strong>Thank you, {form.name.split(" ")[0]} — your enquiry is with us.</strong>
            <p className="muted" style={{ marginTop: 8, fontSize: "var(--t-small)", lineHeight: 1.7 }}>
              {status.note} You'll hear back at {form.contact} within one working day.
              Want a faster answer? The WhatsApp line goes straight to the studio desk.
            </p>
            <a
              className="btn btn-wa"
              style={{ marginTop: 16 }}
              href={waLink(buildWhatsAppEnquiry(payload()))}
              target="_blank"
              rel="noreferrer"
            >
              Send the same details on WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* ————— fallback (network down → WhatsApp handoff) ————— */
  if (status.state === "fallback") {
    return (
      <div className="card" style={{ padding: "var(--s-6)", border: "1px solid var(--line)" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <span style={{ fontSize: "1.3rem", lineHeight: 1.2 }}>⚠</span>
          <div>
            <strong>Couldn't reach the studio desk ({status.reason}).</strong>
            <p className="muted" style={{ marginTop: 8, fontSize: "var(--t-small)", lineHeight: 1.7 }}>
              Nothing was lost — your full enquiry is pre-filled in WhatsApp below.
              Send it there and it lands on the studio desk directly.
            </p>
            <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                className="btn btn-wa"
                href={waLink(buildWhatsAppEnquiry(payload()))}
                target="_blank"
                rel="noreferrer"
              >
                Continue on WhatsApp
              </a>
              <button className="btn btn-ghost" onClick={() => setStatus({ state: "idle" })}>
                Try submitting again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ————— active form ————— */
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        next();
      }}
      noValidate
      style={{ display: "grid", gap: "var(--s-7)" }}
    >
      {/* step rail */}
      <div className="step-rail" aria-label={`Step ${step + 1} of 4: ${ENQUIRY_STEPS[step].label}`}>
        {ENQUIRY_STEPS.map((s, i) => (
          <span key={s.key} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span className={`dot ${i <= step ? "on" : ""}`} />
            <span style={{ color: i === step ? "var(--ink)" : "var(--ink-faint)" }}>{s.label}</span>
            {i < ENQUIRY_STEPS.length - 1 && <span className="bar" />}
          </span>
        ))}
      </div>

      {/* STEP 0 — shoot type */}
      {step === 0 && (
        <fieldset style={{ display: "grid", gap: 12, border: "none", padding: 0, margin: 0 }}>
          <legend className="sr-only">Choose a shoot type</legend>
          <div className="choice-grid">
            {SHOOT_TYPES.map((t) => (
              <button
                type="button"
                key={t.key}
                onClick={() => {
                  set("shootType", t.key);
                  setErrors({});
                }}
                aria-pressed={form.shootType === t.key}
                style={{
                  display: "grid",
                  gap: 4,
                  padding: "16px 18px",
                  border: `1px solid ${form.shootType === t.key ? "var(--accent)" : "var(--line)"}`,
                  background: form.shootType === t.key ? "color-mix(in srgb, var(--accent) 8%, var(--bg-elevated))" : "var(--bg-elevated)",
                  textAlign: "left",
                  transition: "border-color 160ms",
                }}
              >
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 500 }}>
                  {t.label}
                </span>
                <span style={{ fontSize: "var(--t-small)", color: "var(--ink-faint)" }}>{t.desc}</span>
              </button>
            ))}
          </div>
          {errors.shootType && (
            <p className="err" role="alert">
              {errors.shootType}
            </p>
          )}
        </fieldset>
      )}

      {/* STEP 1 — dates & scale (conditional) */}
      {step === 1 && (
        <div style={{ display: "grid", gap: 16, maxWidth: "46ch" }}>
          {isSpaceOnly ? (
            <div className="field">
              <label>Which block of the studio do you need?</label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {["4h", "8h", "Full day", "Weekend"].map((b) => (
                  <button
                    key={b}
                    type="button"
                    className={`chip ${form.spaceBlock === b ? "active" : ""}`}
                    onClick={() => set("spaceBlock", b)}
                    aria-pressed={form.spaceBlock === b}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          ) : isPodcast ? (
            <div className="field">
              <label htmlFor="episodes">How many episodes or sessions this time?</label>
              <select id="episodes" value={form.episodeCount} onChange={(e) => set("episodeCount", e.target.value)}>
                <option value="1">1 episode / session</option>
                <option value="2">2 episodes</option>
                <option value="3-5">3–5 episodes (a season)</option>
                <option value="recurring">Recurring (weekly / monthly)</option>
              </select>
              {form.episodeCount === "recurring" && (
                <p className="muted" style={{ fontSize: "var(--t-small)" }}>
                  We hold one block a week or month against the podcast suite — we'll confirm cadence on the call.
                </p>
              )}
            </div>
          ) : (
            <div className={`field ${errors.dates ? "has-err" : ""}`}>
              <label htmlFor="dates">Tentative shoot date (or "flexible")</label>
              <input
                id="dates"
                type="text"
                placeholder="e.g. first week of March, or 14–16 March"
                value={form.dates}
                onChange={(e) => set("dates", e.target.value)}
              />
              {errors.dates && (
                <span className="err" role="alert">
                  {errors.dates}
                </span>
              )}
            </div>
          )}

          {!isSpaceOnly && !isPodcast && (
            <div className="field">
              <label htmlFor="budget">Rough budget range (optional)</label>
              <select id="budget" value={form.budget} onChange={(e) => set("budget", e.target.value)}>
                <option value="">Prefer to hear your quote first</option>
                <option value="₹25k – ₹75k">₹25k – ₹75k</option>
                <option value="₹75k – ₹2L">₹75k – ₹2L</option>
                <option value="₹2L – ₹5L">₹2L – ₹5L</option>
                <option value="₹5L+">₹5L+</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* STEP 2 — crew & kit (conditional) */}
      {step === 2 && (
        <div style={{ display: "grid", gap: 20, maxWidth: "56ch" }}>
          {!isSpaceOnly && !isOther && (
            <div className={`field ${errors.crewSize ? "has-err" : ""}`}>
              <label>How many people on set?</label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {CREW_SIZES.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    className={`chip ${form.crewSize === c.key ? "active" : ""}`}
                    onClick={() => set("crewSize", c.key)}
                    aria-pressed={form.crewSize === c.key}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              {errors.crewSize && (
                <span className="err" role="alert">
                  {errors.crewSize}
                </span>
              )}
            </div>
          )}

          {!isSpaceOnly && !isOther && (
            <div className="field">
              <label>What do you need from us? (pick any)</label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {KIT_NEEDS.map((k) => (
                  <button
                    key={k.key}
                    type="button"
                    className={`chip ${form.kit.includes(k.key) ? "active" : ""}`}
                    onClick={() => toggleKit(k.key)}
                    aria-pressed={form.kit.includes(k.key)}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isOther && (
            <div className="field">
              <label htmlFor="other-brief">Describe the project in your own words</label>
              <textarea
                id="other-brief"
                placeholder="What are we making, and what does it need to look like?"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {/* STEP 3 — contact details */}
      {step === 3 && (
        <div style={{ display: "grid", gap: 16, maxWidth: "56ch" }}>
          <div className="choice-grid">
            <div className={`field ${errors.name ? "has-err" : ""}`}>
              <label htmlFor="name">Your name</label>
              <input
                id="name"
                autoComplete="name"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
              {errors.name && (
                <span className="err" role="alert">
                  {errors.name}
                </span>
              )}
            </div>
            <div className="field">
              <label htmlFor="company">Studio / brand (optional)</label>
              <input
                id="company"
                placeholder="Company, label or channel"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
              />
            </div>
          </div>

          <div className="choice-grid">
            <div className={`field ${errors.contact ? "has-err" : ""}`}>
              <label htmlFor="contact">
                {form.contactType === "phone" ? "Phone (with country code)" : "Email"}
              </label>
              <input
                id="contact"
                type={form.contactType === "phone" ? "tel" : "email"}
                autoComplete={form.contactType === "phone" ? "tel" : "email"}
                placeholder={form.contactType === "phone" ? "+91 98xxxxxxx" : "you@studio.in"}
                value={form.contact}
                onChange={(e) => set("contact", e.target.value)}
              />
              {errors.contact && (
                <span className="err" role="alert">
                  {errors.contact}
                </span>
              )}
            </div>
            <div className="field">
              <label>Prefer to be reached via</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={`chip ${form.contactType === "phone" ? "active" : ""}`}
                  onClick={() => set("contactType", "phone")}
                  aria-pressed={form.contactType === "phone"}
                >
                  WhatsApp / call
                </button>
                <button
                  type="button"
                  className={`chip ${form.contactType === "email" ? "active" : ""}`}
                  onClick={() => set("contactType", "email")}
                  aria-pressed={form.contactType === "email"}
                >
                  Email
                </button>
              </div>
            </div>
          </div>

          {!isOther && (
            <div className="field">
              <label htmlFor="notes">Anything else we should know? (optional)</label>
              <textarea
                id="notes"
                placeholder="References, mood, deadlines, previous work with us…"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
          )}

          {status.state === "sending" && (
            <div className="form-status" role="status" aria-live="polite" style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span className="spinner" />
              <span>Sending to the studio desk…</span>
            </div>
          )}
        </div>
      )}

      {/* actions */}
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={back}
          disabled={step === 0 || status.state === "sending"}
          style={step === 0 ? { opacity: 0.4, cursor: "default" } : undefined}
        >
          ← Back
        </button>
        <div className="form-actions-next">
          <a className="btn btn-ghost" href={waMsg} target="_blank" rel="noreferrer">
            WhatsApp the desk
          </a>
          <button type="submit" className={`btn ${step === 3 ? "btn-primary" : "btn-ghost"}`}>
            {step < 3 ? `Continue — ${ENQUIRY_STEPS[step + 1].label}` : "Send enquiry"}
          </button>
        </div>
      </div>

      <p className="muted" style={{ fontSize: "var(--t-micro)", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Or skip the form — <Link to="/work" style={{ textDecoration: "underline" }}>see the finished work first</Link>{" "}
        · <Link to="/studio" style={{ textDecoration: "underline" }}>tour the studio</Link>
      </p>
    </form>
  );
}
