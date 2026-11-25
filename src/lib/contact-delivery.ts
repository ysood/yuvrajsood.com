type DeliveryConfig = {
  apiKey: string;
  from: string;
  to: string;
};

type ContactMessage = {
  email: string;
  message: string;
  requestId: string;
};

export async function sendContactEmail(config: DeliveryConfig, contact: ContactMessage) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `contact/${contact.requestId}`,
    },
    body: JSON.stringify({
      from: `Yuvraj Sood website <${config.from}>`,
      to: [config.to],
      reply_to: contact.email,
      subject: "New website enquiry",
      text: `From: ${contact.email}\n\n${contact.message}`,
    }),
  });

  if (!response.ok) return false;

  const result = (await response.json()) as { id?: unknown };
  return typeof result.id === "string" && result.id.length > 0;
}
