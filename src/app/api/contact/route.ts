import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/contact";

// Sends an enquiry by email through Resend. Never reports success unless Resend accepted it.
// Without RESEND_API_KEY it returns 503 { fallback: true } and the form shows the email address.
// Personal data is never logged in production.

const WINDOW = 10 * 60 * 1000, LIMIT = 5;
const hits = new Map<string, number[]>();
function limited(ip: string, now: number) {
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW)) hits.delete(k);
  return recent.length > LIMIT;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  if (limited(ip, Date.now())) return NextResponse.json({ ok: false, error: "Too many messages. Please try again in a few minutes, or email us." }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 }); }

  // A filled honeypot is a bot: pretend nothing happened, send nothing.
  if (body && typeof body === "object" && "fax" in body && (body as { fax?: unknown }).fax) {
    return NextResponse.json({ ok: false, error: "Message not sent." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) { const k = String(issue.path[0] ?? "form"); if (!fields[k]) fields[k] = issue.message; }
    return NextResponse.json({ ok: false, error: "Please check the highlighted fields.", fields }, { status: 422 });
  }

  const key = process.env.RESEND_API_KEY, to = process.env.CONTACT_TO_EMAIL, from = process.env.CONTACT_FROM_EMAIL;
  if (!key || !to || !from) return NextResponse.json({ ok: false, fallback: true }, { status: 503 });

  const d = parsed.data;
  const rows: [string, string][] = [
    ["Name", d.name], ["Email", d.email], ["Phone", d.phone || ""], ["Business", d.business || ""], ["Website", d.website || ""],
    ["Needs", d.needs.join(", ")], ["Timeline", d.timeline || ""], ["Budget", d.budget || ""],
  ];
  const text = rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\n${d.message}`;
  const html = `<table cellpadding="6">${rows.filter(([, v]) => v).map(([k, v]) => `<tr><td><b>${k}</b></td><td>${esc(v)}</td></tr>`).join("")}</table><p style="white-space:pre-wrap">${esc(d.message)}</p>`;

  try {
    const { error } = await new Resend(key).emails.send({ from, to, replyTo: d.email, subject: `New enquiry: ${d.business || d.name}`, text, html });
    if (error) {
      if (process.env.NODE_ENV !== "production") console.error("[contact] Resend error", error.name);
      return NextResponse.json({ ok: false, fallback: true }, { status: 502 });
    }
  } catch {
    if (process.env.NODE_ENV !== "production") console.error("[contact] Resend request failed");
    return NextResponse.json({ ok: false, fallback: true }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
