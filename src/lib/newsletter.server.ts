import type { z } from "zod";
import {
  COLLECTIONS,
  Q,
  createDoc,
  findDoc,
  listDocs,
  updateDoc,
} from "@/integrations/appwrite/admin.server";
import { sendEmail, type EmailAttachment } from "./notifications-impl.server";
import { campaignSchema, subscribeSchema } from "./admin.schema";
import { buildNewsletterHtml } from "./newsletter-template";

export { campaignSchema, subscribeSchema };

type SubscriberDoc = { email: string; name: string | null; is_subscribed: boolean };
type CampaignDoc = {
  subject: string;
  body: string;
  recipients: number;
  created_by: string | null;
};

export async function addSubscriber(input: z.infer<typeof subscribeSchema>) {
  const email = input.email.toLowerCase();
  const existing = await findDoc<SubscriberDoc>(COLLECTIONS.newsletterSubscribers, [
    Q.equal("email", email),
  ]);
  const payload = { email, name: input.name ?? null, is_subscribed: true };
  if (existing) await updateDoc(COLLECTIONS.newsletterSubscribers, existing.$id, payload);
  else await createDoc(COLLECTIONS.newsletterSubscribers, payload);
  return { ok: true as const };
}

export async function removeSubscriber(email: string) {
  const cleanEmail = email.toLowerCase().trim();
  const existing = await findDoc<SubscriberDoc>(COLLECTIONS.newsletterSubscribers, [
    Q.equal("email", cleanEmail),
  ]);
  if (existing) {
    await updateDoc(COLLECTIONS.newsletterSubscribers, existing.$id, {
      email: cleanEmail,
      is_subscribed: false,
    });
  }
  return { ok: true as const };
}

export async function fetchSubscribers() {
  const docs = await listDocs<SubscriberDoc>(COLLECTIONS.newsletterSubscribers, [
    Q.orderDesc("$createdAt"),
    Q.limit(500),
  ]);
  return docs.map((d) => ({
    id: d.$id,
    email: d.email,
    name: d.name ?? null,
    is_subscribed: Boolean(d.is_subscribed),
    created_at: d.$createdAt,
  }));
}

export async function fetchCampaigns() {
  const docs = await listDocs<CampaignDoc>(COLLECTIONS.newsletterCampaigns, [
    Q.orderDesc("$createdAt"),
    Q.limit(50),
  ]);
  return docs.map((d) => ({
    id: d.$id,
    subject: d.subject,
    body: d.body,
    recipients: Number(d.recipients),
    sent_at: d.$createdAt,
  }));
}

export async function sendCampaign(userId: string, input: z.infer<typeof campaignSchema>) {
  const recipients = await listDocs<SubscriberDoc>(COLLECTIONS.newsletterSubscribers, [
    Q.equal("is_subscribed", true),
    Q.limit(500),
  ]);

  const html = buildNewsletterHtml(input);

  const attachments: EmailAttachment[] = [];
  if (input.attachment_b64 && input.attachment_name) {
    attachments.push({
      filename: input.attachment_name,
      content: input.attachment_b64,
      content_type: input.attachment_mime || "application/octet-stream",
    });
  }

  for (const subscriber of recipients) {
    await sendEmail({
      to: subscriber.email,
      subject: input.subject,
      text: input.body,
      html,
      attachments: attachments.length > 0 ? attachments : undefined,
    });
  }

  await createDoc(COLLECTIONS.newsletterCampaigns, {
    subject: input.subject,
    body: input.body,
    recipients: recipients.length,
    created_by: userId,
  });

  return { ok: true as const, recipients: recipients.length };
}