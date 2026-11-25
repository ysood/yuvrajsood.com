"use server";

import { isIP } from "node:net";

import { headers } from "next/headers";
import { z } from "zod";

import { sendContactEmail } from "@/lib/contact-delivery";

export type ContactState =
  | { status: "idle" | "sent" }
  | { status: "error"; message: string };

const emailAddress = z
  .string("Enter a valid email address.")
  .trim()
  .max(254, "Email address must be 254 characters or fewer.")
  .pipe(z.email("Enter a valid email address."));
const contactSchema = z.object({
  email: emailAddress,
  message: z
    .string("Write a message before sending.")
    .trim()
    .min(1, "Write a message before sending.")
    .max(3000, "Keep your message to 3,000 characters or fewer."),
  requestId: z.uuid("Please try sending your message again."),
});

const rateWindow = 10 * 60 * 1000;
const maxPerWindow = 5;
const maxTrackedClients = 2000;
const attempts = new Map<string, { count: number; expires: number }>();
let nextSweep = 0;

function allowAttempt(ip: string) {
  const now = Date.now();
  if (now >= nextSweep) {
    for (const [key, entry] of attempts) {
      if (entry.expires <= now) attempts.delete(key);
    }
    nextSweep = now + rateWindow;
  }

  const entry = attempts.get(ip);
  if (entry && entry.expires > now) {
    if (entry.count >= maxPerWindow) return false;
    entry.count++;
    return true;
  }

  if (!entry && attempts.size >= maxTrackedClients) return false;
  attempts.set(ip, { count: 1, expires: now + rateWindow });
  return true;
}

export async function sendContactMessage(_previous: ContactState, formData: FormData): Promise<ContactState> {
  if (formData.get("contactWebsite")) return { status: "sent" };

  const contact = contactSchema.safeParse({
    email: formData.get("email"),
    message: formData.get("message"),
    requestId: formData.get("requestId"),
  });
  if (!contact.success) {
    return { status: "error", message: contact.error.issues[0].message };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = emailAddress.safeParse(process.env.CONTACT_FROM_EMAIL);
  const to = emailAddress.safeParse(process.env.CONTACT_TO_EMAIL);
  if (!apiKey || !from.success || !to.success) {
    console.error("contact.delivery.unconfigured");
    return { status: "error", message: "Contact is temporarily unavailable. Please try again later." };
  }

  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!allowAttempt(forwarded && isIP(forwarded) ? forwarded : "unknown")) {
    return { status: "error", message: "Too many messages. Please try again in a few minutes." };
  }

  try {
    if (await sendContactEmail({ apiKey, from: from.data, to: to.data }, contact.data)) {
      return { status: "sent" };
    }
  } catch {
    // Avoid logging a provider response that may include contact details.
  }
  console.error("contact.delivery.failed");
  return { status: "error", message: "Your message couldn’t be sent. Please try again." };
}
