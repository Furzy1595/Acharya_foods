// Sends what a visitor wrote to the Acharya Foods business system.
// The address of the system comes from content/site.json ("api.baseUrl").
// When the system cannot be reached (office computer off, no internet), nothing
// is lost: the form offers the same message by email, WhatsApp or phone instead.
import { content } from '../content';

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
  /** Support requests. */
  boughtAt?: string;
  packDetails?: string;
}

export type SendResult =
  | { ok: true; reference?: string }
  | { ok: false; reason: 'not-connected' | 'unreachable' | 'refused'; message?: string };

export function apiBase(): string {
  // VITE_API_BASE is for trying the site against a system on your own computer (see README).
  const base = (import.meta.env.VITE_API_BASE as string | undefined) || content.api.baseUrl || '';
  return base.trim().replace(/\/+$/, '');
}

export const isConnected = () => apiBase() !== '';

const TIMEOUT_MS = 12_000;

export async function sendInquiry(
  inquiry: Inquiry,
  meta: { page: string; startedAt: number; trap: string },
): Promise<SendResult> {
  const base = apiBase();
  if (!base) return { ok: false, reason: 'not-connected' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${base}/api/public/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit',
      signal: controller.signal,
      body: JSON.stringify({
        ...inquiry,
        page: meta.page,
        // Two quiet checks against robots: a box people never see, and how long the form took.
        website: meta.trap,
        elapsedMs: Date.now() - meta.startedAt,
      }),
    });
    const body = (await response.json().catch(() => ({}))) as { reference?: string; error?: string };
    if (response.ok) return { ok: true, reference: body.reference };
    // 4xx: the system looked at the message and said no (for example too many messages in a row).
    if (response.status >= 400 && response.status < 500) {
      return { ok: false, reason: 'refused', message: body.error };
    }
    return { ok: false, reason: 'unreachable' };
  } catch {
    return { ok: false, reason: 'unreachable' };
  } finally {
    clearTimeout(timer);
  }
}
