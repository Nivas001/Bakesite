const GATEWAY = "https://connector-gateway.lovable.dev";

function creds(keyName: string) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env[keyName];
  if (!lovableKey || !connectionKey) return null;
  return { lovableKey, connectionKey };
}

/** Sends an SMS through Twilio when the connector is linked, otherwise logs. */
export async function sendSms(to: string | null, body: string): Promise<void> {
  const c = creds("TWILIO_API_KEY");
  const from = process.env["TWILIO_FROM_NUMBER"];
  if (!to || !c || !from) {
    console.info("[sms skipped]", { to, body });
    return;
  }
  const response = await fetch(`${GATEWAY}/twilio/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${c.lovableKey}`,
      "X-Connection-Api-Key": c.connectionKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  });
  if (!response.ok) {
    console.error(`[twilio] send failed [${response.status}]: ${await response.text()}`);
  }
}

/** Sends an email through Mailgun when the connector is linked, otherwise logs. */
export async function sendEmail(input: {
  to: string | null;
  subject: string;
  text: string;
}): Promise<void> {
  const c = creds("MAILGUN_API_KEY");
  const domain = process.env["MAILGUN_DOMAIN"];
  if (!input.to || !c || !domain) {
    console.info("[email skipped]", input);
    return;
  }
  const response = await fetch(`${GATEWAY}/mailgun/${domain}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${c.lovableKey}`,
      "X-Connection-Api-Key": c.connectionKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      from: `Sweet Crumb Bakery <bakery@${domain}>`,
      to: input.to,
      subject: input.subject,
      text: input.text,
    }),
  });
  if (!response.ok) {
    console.error(`[mailgun] send failed [${response.status}]: ${await response.text()}`);
  }
}