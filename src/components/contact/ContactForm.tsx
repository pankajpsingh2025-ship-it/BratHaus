"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BUDGETS, INTEREST, NEEDS, TIMELINES, contactSchema } from "@/lib/contact";
import s from "./ContactForm.module.css";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; name: string } | { kind: "failed"; message?: string };
const MIN = 30;

// One form, two sizes: "short" (home closing form: name, email, what you need, message) and "full"
// (contact page: the application-style fields). Both post to /api/contact and never claim success
// unless the email really went: without an email key the API says so and the form shows the address.
export default function ContactForm({ email, bookingUrl, variant = "full", idPrefix = "cf" }: { email: string; bookingUrl: string; variant?: "full" | "short"; idPrefix?: string }) {
  const params = useSearchParams();
  const [needs, setNeeds] = useState<string[]>(() => [...(INTEREST[params.get("interest") || ""] ?? [])]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const panel = useRef<HTMLDivElement>(null);
  const id = (k: string) => `${idPrefix}-${k}`;
  useEffect(() => { if (status.kind === "sent" || status.kind === "failed") panel.current?.focus(); }, [status.kind]);
  const toggle = (n: string) => setNeeds((cur) => (cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n]));

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {
      name: String(f.get("name") || ""), email: String(f.get("email") || ""), phone: String(f.get("phone") || ""),
      business: String(f.get("business") || ""), website: String(f.get("website") || ""), needs,
      timeline: String(f.get("timeline") || ""), budget: String(f.get("budget") || ""), message,
      consent: f.get("consent") === "on", fax: String(f.get("fax") || ""),
    };
    const check = contactSchema.safeParse(data);
    if (!check.success) {
      const fields: Record<string, string> = {};
      for (const i of check.error.issues) { const k = String(i.path[0]); if (!fields[k]) fields[k] = i.message; }
      setErrors(fields);
      e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(fields)[0]}"]`)?.focus();
      return;
    }
    setErrors({});
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok === true) { setStatus({ kind: "sent", name: data.name.split(" ")[0] }); return; }
      if (res.status === 422 && json.fields) { setErrors(json.fields); setStatus({ kind: "idle" }); return; }
      setStatus({ kind: "failed", message: res.status === 429 ? json.error : undefined });
    } catch {
      setStatus({ kind: "failed" });
    }
  }

  const err = (k: string) => (errors[k] ? <p className={s.err} id={id(`${k}-err`)}>{errors[k]}</p> : null);
  const aria = (k: string) => ({ "aria-invalid": Boolean(errors[k]) || undefined, "aria-describedby": errors[k] ? id(`${k}-err`) : undefined });

  if (status.kind === "sent") return (
    <div ref={panel} tabIndex={-1} className={`${s.panel} ${s.ok}`} role="status">
      <span className={s.tick} aria-hidden="true">✓</span>
      <p className="display t-chapter">Thanks, {status.name}. Message received.</p>
      <p className="lead soft">We&apos;ll reply within one working day.</p>
      <Link className="tlink" href="/work">While you wait, see the work <span className="arr" aria-hidden="true">→</span></Link>
    </div>
  );

  const full = variant === "full";
  return (
    <form className={s.form} onSubmit={submit} noValidate>
      {status.kind === "failed" && (
        <div ref={panel} tabIndex={-1} className={`${s.panel} ${s.bad}`} role="alert">
          <p><b>Your message wasn&apos;t sent.</b> {status.message || "The form can't send right now."} Please email us at <a className="tlink" href={`mailto:${email}`}>{email}</a>{bookingUrl ? <> or <a className="tlink" href={bookingUrl} target="_blank" rel="noopener">book a call</a></> : null}, and we&apos;ll reply within one working day.</p>
        </div>
      )}

      <div className={s.row}>
        <div className={s.field}>
          <label htmlFor={id("name")}>Name <span aria-hidden="true">*</span></label>
          <input id={id("name")} name="name" autoComplete="name" required {...aria("name")} />
          {err("name")}
        </div>
        <div className={s.field}>
          <label htmlFor={id("email")}>Email <span aria-hidden="true">*</span></label>
          <input id={id("email")} name="email" type="email" autoComplete="email" required {...aria("email")} />
          {err("email")}
        </div>
      </div>
      {full && (
        <>
          <div className={s.row}>
            <div className={s.field}>
              <label htmlFor={id("phone")}>Phone <small>(optional)</small></label>
              <input id={id("phone")} name="phone" type="tel" autoComplete="tel" />
            </div>
            <div className={s.field}>
              <label htmlFor={id("business")}>Business name</label>
              <input id={id("business")} name="business" autoComplete="organization" />
            </div>
          </div>
          <div className={s.field}>
            <label htmlFor={id("website")}>Website <small>(optional)</small></label>
            <input id={id("website")} name="website" type="text" inputMode="url" placeholder="yourbusiness.co.uk" autoComplete="url" />
          </div>
        </>
      )}

      <fieldset className={`${s.field} ${s.set}`}>
        <legend>What do you need?</legend>
        <div className={s.chips}>
          {NEEDS.map((n) => (
            <label key={n} className={`${s.chip} ${needs.includes(n) ? s.on : ""}`}>
              <input type="checkbox" name="needs" value={n} checked={needs.includes(n)} onChange={() => toggle(n)} />
              {n}
            </label>
          ))}
        </div>
      </fieldset>

      {full && (
        <div className={s.row}>
          <div className={s.field}>
            <label htmlFor={id("timeline")}>Timeline</label>
            <select id={id("timeline")} name="timeline" defaultValue=""><option value="">Choose one</option>{TIMELINES.map((t) => <option key={t}>{t}</option>)}</select>
          </div>
          <div className={s.field}>
            <label htmlFor={id("budget")}>Rough budget <small>(optional)</small></label>
            <select id={id("budget")} name="budget" defaultValue=""><option value="">Choose one</option>{BUDGETS.map((b) => <option key={b}>{b}</option>)}</select>
          </div>
        </div>
      )}

      <div className={s.field}>
        <label htmlFor={id("message")}>{full ? "Tell us about the project" : "Message"} <span aria-hidden="true">*</span></label>
        <textarea id={id("message")} name="message" rows={full ? 6 : 4} value={message} onChange={(e) => setMessage(e.target.value)} required {...aria("message")} placeholder="What does the business do, and what would you like to change?" />
        <p className={`${s.count} ${message.trim().length >= MIN ? s.countOk : ""}`} aria-live="polite">{message.trim().length} / {MIN} characters minimum</p>
        {err("message")}
      </div>

      <div className={s.hp} aria-hidden="true">
        <label htmlFor={id("fax")}>Leave this empty</label>
        <input id={id("fax")} name="fax" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={s.field}>
        <label className={s.consent}>
          <input type="checkbox" name="consent" {...aria("consent")} />
          <span>I&apos;m happy for BratHaus to use these details to reply to my enquiry, as described in the <Link className="tlink" href="/privacy">privacy notice</Link>.</span>
        </label>
        {err("consent")}
      </div>

      <div className={s.submit}>
        <button type="submit" className="btn" disabled={status.kind === "sending"} aria-busy={status.kind === "sending"}>
          {status.kind === "sending" ? "Sending…" : "Send"} <span className="arr" aria-hidden="true">→</span>
        </button>
        <span className="soft">Takes about a minute.</span>
      </div>
    </form>
  );
}
