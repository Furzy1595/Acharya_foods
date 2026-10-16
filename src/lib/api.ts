// Sends what a visitor wrote.
//
// 1. When the business system is linked ("api.baseUrl" in content/site.json), the message goes there.
// 2. Otherwise it is emailed to "forms.sendTo" through FormSubmit (formsubmit.co), a free
//    form-to-email service that needs no server. The first message ever sent asks the owner
//    of that mailbox to press "Activate" once; after that every message arrives as an email.
// 3. If neither works (no internet, service down, not activated yet), nothing is lost:
//    the form offers the same message by email, WhatsApp or phone instead.
import { content, findProduct } from '../content';

export type InquiryType = 'customer' | 'dealer' | 'support';

export interface Inquiry {
  type: InquiryType;
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  /** The product the visitor is asking about, if any. */
  productSlug?: string;
  /** Dealer applications. */
  businessName?: string;
  businessType?: string;
  location?: string;
  /** Products a dealer would like to stock (slugs). */
  interestedIn?: string[];
  /** Support requests. */
  boughtAt?: string;
  packDetails?: string;
}

export type SendResult =
  | { ok: true; reference?: string; via: 'system' | 'email' }
  | { ok: false; reason: 'not-connected' | 'unreachable' | 'refused'; message?: string };

export function apiBase(): string {
  // VITE_API_BASE is for trying the site against a system on your own computer (see README).
  const base = (import.meta.env.VITE_API_BASE as string | undefined) || content.api.baseUrl || '';
  return base.trim().replace(/\/+$/, '');
}

function relayAddress(): string {
  const to = content.forms?.sendTo?.trim();
  const relay = content.forms?.relay?.trim();
  if (import.meta.env.VITE_NO_EMAIL_RELAY) return '';
  return to && relay ? relay + encodeURIComponent(to) : '';
}

/** True when a form can send by itself (business system or email relay). */
export const isConnected = () => apiBase() !== '' || relayAddress() !== '';

const TIMEOUT_MS = 15_000;

export async function sendInquiry(
  inquiry: Inquiry,
  meta: { page: string; startedAt: number; trap: string },
): Promise<SendResult> {
  if (apiBase()) return sendToSystem(inquiry, meta);
  if (relayAddress()) return sendByEmail(inquiry, meta);
  return { ok: false, reason: 'not-connected' };
}

async function post(url: string, body: unknown): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'omit',
      signal: controller.signal,
      body: JSON.stringify(body),
    });
  } finally {
    clearTimeout(timer);
  }
}

async function sendToSystem(inquiry: Inquiry, meta: { page: string; startedAt: number; trap: string }): Promise<SendResult> {
  try {
    const response = await post(`${apiBase()}/api/public/inquiries`, {
      ...inquiry,
      page: meta.page,
      // Two quiet checks against robots: a box people never see, and how long the form took.
      website: meta.trap,
      elapsedMs: Date.now() - meta.startedAt,
    });
    const body = (await response.json().catch(() => ({}))) as { reference?: string; error?: string };
    if (response.ok) return { ok: true, reference: body.reference, via: 'system' };
    // 4xx: the system looked at the message and said no (for example too many messages in a row).
    if (response.status >= 400 && response.status < 500) return { ok: false, reason: 'refused', message: body.error };
    return { ok: false, reason: 'unreachable' };
  } catch {
    return { ok: false, reason: 'unreachable' };
  }
}

const SUBJECT: Record<InquiryType, string> = {
  dealer: 'New dealership application',
  customer: 'New message from the website',
  support: 'New support request',
};

/** The message as labelled lines, in the order the office wants to read them. */
export function inquiryLines(inquiry: Inquiry): [string, string][] {
  const typeLabel = content.dealership.businessTypes.find((t) => t.value === inquiry.businessType)?.label;
  const names = (inquiry.interestedIn ?? []).map((slug) => findProduct(slug)?.name ?? slug);
  const lines: [string, string | undefined][] = [
    ['Name', inquiry.name],
    ['Phone', inquiry.phone],
    ['Email', inquiry.email],
    ['Business name', inquiry.businessName],
    ['Type of business', typeLabel],
    ['Location', inquiry.location],
    ['Would like to stock', names.length ? names.join(', ') : undefined],
    ['Product', findProduct(inquiry.productSlug)?.name],
    ['Bought at', inquiry.boughtAt],
    ['Date or batch on the pack', inquiry.packDetails],
    ['Subject', inquiry.subject],
    [inquiry.type === 'dealer' ? 'About the business' : 'Message', inquiry.message],
  ];
  return lines.filter((l): l is [string, string] => Boolean(l[1]));
}

async function sendByEmail(inquiry: Inquiry, meta: { page: string; startedAt: number; trap: string }): Promise<SendResult> {
  // Robots: say "sent" and send nothing.
  if (meta.trap || Date.now() - meta.startedAt < 1500) return { ok: true, via: 'email' };
  const where = [inquiry.businessName, inquiry.location].filter(Boolean).join(', ');
  const body: Record<string, string> = {
    _subject: `${SUBJECT[inquiry.type]}: ${inquiry.name}${where ? ` (${where})` : ''}`,
    _template: 'table',
    _captcha: 'false',
    ...Object.fromEntries(inquiryLines(inquiry)),
    'Sent from': content.site.url.replace(/\/$/, '') + meta.page,
  };
  if (inquiry.email) {
    body._replyto = inquiry.email;
    body.email = inquiry.email;
    body._autoresponse =
      inquiry.type === 'dealer'
        ? `Namaste ${inquiry.name}, thank you for applying to become an Acharya Foods dealer. We have your application and will reach out within 48 hours. — Acharya Foods, ${content.contact.phone}`
        : `Namaste ${inquiry.name}, thank you for writing to Acharya Foods. We have your message and will get back to you soon. — Acharya Foods, ${content.contact.phone}`;
  }
  try {
    const response = await post(relayAddress(), body);
    const answer = (await response.json().catch(() => ({}))) as { success?: string | boolean; message?: string };
    if (response.ok && String(answer.success) === 'true') return { ok: true, via: 'email' };
    // Not activated yet, or the service refused: keep the visitor's words and offer email / phone.
    return { ok: false, reason: 'unreachable' };
  } catch {
    return { ok: false, reason: 'unreachable' };
  }
}
