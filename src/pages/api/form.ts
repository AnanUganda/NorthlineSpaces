/**
 * Receives the website's Quote and Contact forms and files them in Wix Forms,
 * so they show up in the Wix dashboard (Forms & Submissions), create/update a
 * Contact, and trigger whatever notifications/automations the owner sets up.
 *
 * The two Wix forms ("Website: Free quote", "Website: Contact us") were
 * created through the Wix Forms API. Their field keys ("targets") are below.
 */
import type { APIRoute } from "astro";
import { submissions } from "@wix/forms";

const FORMS = {
  quote: {
    id: "eb91b43d-81fe-43b9-bde4-266d582acc98",
    fields: {
      need: { required: true },
      unit_size: { required: true },
      delivery_date: { required: true },
      delivery_address: { required: true },
      notes: { required: false },
      name: { required: true },
      phone: { required: true },
      email: { required: true },
    },
  },
  contact: {
    id: "ed516d16-c136-47dc-9791-19ec1c83242e",
    fields: {
      name: { required: true },
      phone: { required: false },
      email: { required: true },
      message: { required: true },
    },
  },
} as const;

type FormKey = keyof typeof FORMS;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Wix Forms wants phone numbers with a country code. "760-330-1670" → "+17603301670". */
function toE164(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (raw.trim().startsWith("+") && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Bad request" }, 400);
  }

  const key = String(body.form ?? "") as FormKey;
  const def = FORMS[key];
  if (!def) return json({ ok: false, error: "Unknown form" }, 400);

  // Honeypot: real visitors never see or fill this field.
  if (typeof body.website === "string" && body.website.trim() !== "") return json({ ok: true });

  const values: Record<string, string> = {};
  const missing: string[] = [];
  for (const [field, rule] of Object.entries(def.fields)) {
    const raw = body[field];
    const v = typeof raw === "string" ? raw.trim().slice(0, 4000) : "";
    if (!v) {
      if (rule.required) missing.push(field);
      continue;
    }
    values[field] = v;
  }
  if (values.email && !EMAIL.test(values.email)) missing.push("email");
  if (values.phone) {
    const phone = toE164(values.phone);
    if (phone) values.phone = phone;
    else missing.push("phone");
  }
  if (missing.length) return json({ ok: false, error: "Missing or invalid fields", fields: missing }, 422);

  try {
    await submissions.createSubmission({ formId: def.id, submissions: values });
    return json({ ok: true });
  } catch (err) {
    console.error(`[form:${key}] submission failed`, err);
    return json({ ok: false, error: "Could not send right now" }, 502);
  }
};
