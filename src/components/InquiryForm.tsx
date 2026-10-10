import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { content, digits, findProduct, products } from '../content';
import { isConnected, sendInquiry, type Inquiry, type InquiryType } from '../lib/api';
import { ChatIcon, CheckIcon, MailIcon, PhoneIcon } from './Icons';

interface Props {
  type: InquiryType;
  /** Product the visitor came from, if any. */
  productSlug?: string;
}

type Values = Record<
  'name' | 'email' | 'phone' | 'subject' | 'message' | 'businessName' | 'businessType' | 'location' | 'product' | 'boughtAt' | 'packDetails',
  string
>;

const EMPTY: Values = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  businessName: '',
  businessType: '',
  location: '',
  product: '',
  boughtAt: '',
  packDetails: '',
};

type Status =
  | { step: 'writing'; problem?: string }
  | { step: 'sending' }
  | { step: 'sent'; reference?: string }
  | { step: 'handoff'; why: 'not-connected' | 'unreachable' };

const WORDS: Record<InquiryType, { send: string; sentTitle: string; sentText: string; mailSubject: string }> = {
  customer: {
    send: 'Send message',
    sentTitle: 'Message sent',
    sentText: "Thank you. We'll get back to you soon.",
    mailSubject: 'Message from the website',
  },
  dealer: {
    send: 'Send application',
    sentTitle: 'Application sent',
    sentText: "Thank you. We'll reach out within 48 hours.",
    mailSubject: 'Dealership application from the website',
  },
  support: {
    send: 'Send request',
    sentTitle: 'Request sent',
    sentText: "Thank you. We'll get back to you soon.",
    mailSubject: 'Support request from the website',
  },
};

export function InquiryForm({ type, productSlug }: Props) {
  const location = useLocation();
  const [values, setValues] = useState<Values>(EMPTY);
  const [status, setStatus] = useState<Status>({ step: 'writing' });
  const [trap, setTrap] = useState('');
  const startedAt = useRef(0);
  const resultRef = useRef<HTMLDivElement>(null);
  const words = WORDS[type];
  const { contact, dealership } = content;
  const connected = isConnected();

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // Coming from a product page: say which product this is about.
  useEffect(() => {
    const product = findProduct(productSlug);
    if (!product) return;
    setValues((v) => ({
      ...v,
      product: product.slug,
      subject: v.subject || (type === 'customer' ? `Question about ${product.name}` : v.subject),
    }));
  }, [productSlug, type]);

  useEffect(() => {
    if (status.step === 'sent' || status.step === 'handoff') resultRef.current?.focus();
  }, [status.step]);

  const set = (key: keyof Values) => (value: string) => setValues((v) => ({ ...v, [key]: value }));

  const inquiry = (): Inquiry => {
    const v = Object.fromEntries(Object.entries(values).map(([k, val]) => [k, val.trim()])) as Values;
    const product = findProduct(v.product);
    return {
      type,
      name: v.name,
      ...(v.email && { email: v.email }),
      ...(v.phone && { phone: v.phone }),
      ...(v.subject && { subject: v.subject }),
      ...(v.message && { message: v.message }),
      ...(product && { productSlug: product.slug }),
      ...(type === 'dealer' && {
        ...(v.businessName && { businessName: v.businessName }),
        businessType: v.businessType,
        location: v.location,
      }),
      ...(type === 'support' && {
        ...(v.boughtAt && { boughtAt: v.boughtAt }),
        ...(v.packDetails && { packDetails: v.packDetails }),
      }),
    };
  };

  /** The same message as plain text, for email and WhatsApp. */
  const asText = (): string => {
    const q = inquiry();
    const product = findProduct(q.productSlug);
    const typeLabel = dealership.businessTypes.find((t) => t.value === q.businessType)?.label;
    const lines: [string, string | undefined][] = [
      ['Name', q.name],
      ['Phone', q.phone],
      ['Email', q.email],
      ['Business', q.businessName],
      ['Type of business', typeLabel],
      ['Location', q.location],
      ['Product', product?.name ?? (values.product === 'other' ? 'Something else' : undefined)],
      ['Bought at', q.boughtAt],
      ['On the pack', q.packDetails],
      ['Subject', q.subject],
    ];
    const head = lines.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`);
    return [words.mailSubject, '', ...head, ...(q.message ? ['', q.message] : [])].join('\n');
  };

  const mailto = () =>
    `mailto:${contact.email}?subject=${encodeURIComponent(values.subject.trim() || words.mailSubject)}&body=${encodeURIComponent(asText())}`;
  const whatsappLink = () =>
    contact.whatsapp ? `https://wa.me/${digits(contact.whatsapp).replace('+', '')}?text=${encodeURIComponent(asText())}` : '';

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (status.step === 'sending') return;
    if (type !== 'dealer' && !values.email.trim() && !values.phone.trim()) {
      setStatus({ step: 'writing', problem: 'Add a phone number or an email address so we can answer you.' });
      return;
    }
    if (!connected) {
      // The business system is not linked yet: hand the message to the visitor's email app.
      window.location.href = mailto();
      setStatus({ step: 'handoff', why: 'not-connected' });
      return;
    }
    setStatus({ step: 'sending' });
    const result = await sendInquiry(inquiry(), { page: location.pathname, startedAt: startedAt.current, trap });
    if (result.ok) {
      setStatus({ step: 'sent', reference: result.reference });
      setValues(EMPTY);
    } else if (result.reason === 'refused') {
      setStatus({
        step: 'writing',
        problem: result.message || 'This could not be accepted. Check what you wrote and send it again.',
      });
    } else {
      setStatus({ step: 'handoff', why: 'unreachable' });
    }
  }

  if (status.step === 'sent') {
    return (
      <div className="form-result" ref={resultRef} tabIndex={-1} role="status">
        <span className="form-result__mark">
          <CheckIcon />
        </span>
        <h3>{words.sentTitle}</h3>
        <p>{words.sentText}</p>
        {status.reference && (
          <p>
            Your reference is <strong>{status.reference}</strong>. Mention it if you call us about this.
          </p>
        )}
        <button type="button" className="btn btn-outline" onClick={() => setStatus({ step: 'writing' })}>
          Write another message
        </button>
      </div>
    );
  }

  if (status.step === 'handoff') {
    const wa = whatsappLink();
    return (
      <div className="form-result form-result--handoff" ref={resultRef} tabIndex={-1} role="status">
        {status.why === 'not-connected' ? (
          <>
            <h3>Your email app has the message</h3>
            <p>
              Press send there to finish. If no email app opened, use one of these — what you wrote is already filled
              in.
            </p>
          </>
        ) : (
          <>
            <h3>Not sent yet</h3>
            <p>
              The website could not reach our office just now. What you wrote is kept — send it one of these ways
              instead.
            </p>
          </>
        )}
        <div className="handoff-actions">
          <a className="btn btn-primary" href={mailto()}>
            <MailIcon /> Send by email
          </a>
          {wa && (
            <a className="btn btn-primary" href={wa} rel="noopener">
              <ChatIcon /> Send on WhatsApp
            </a>
          )}
          <a className="btn btn-outline" href={`tel:${digits(contact.phone)}`}>
            <PhoneIcon /> Call {contact.phone}
          </a>
        </div>
        <button type="button" className="link-button" onClick={() => setStatus({ step: 'writing' })}>
          {status.why === 'unreachable' ? 'Back to the form to try again' : 'Back to the form'}
        </button>
      </div>
    );
  }

  const sending = status.step === 'sending';

  return (
    <form className="inquiry-form" onSubmit={submit} noValidate={false}>
      <Field label="Your name" required>
        {(id) => (
          <input id={id} type="text" autoComplete="name" required maxLength={120} value={values.name} onChange={(e) => set('name')(e.target.value)} />
        )}
      </Field>

      <div className="field-row">
        <Field label="Phone" required={type === 'dealer'}>
          {(id) => (
            <input id={id} type="tel" inputMode="tel" autoComplete="tel" required={type === 'dealer'} maxLength={30} value={values.phone} onChange={(e) => set('phone')(e.target.value)} />
          )}
        </Field>
        <Field label="Email">
          {(id) => (
            <input id={id} type="email" autoComplete="email" maxLength={160} value={values.email} onChange={(e) => set('email')(e.target.value)} />
          )}
        </Field>
      </div>

      {type === 'dealer' && (
        <>
          <Field label="Business name" hint="If you have one">
            {(id) => (
              <input id={id} type="text" autoComplete="organization" maxLength={160} value={values.businessName} onChange={(e) => set('businessName')(e.target.value)} />
            )}
          </Field>
          <div className="field-row">
            <Field label="Type of business" required>
              {(id) => (
                <select id={id} required value={values.businessType} onChange={(e) => set('businessType')(e.target.value)}>
                  <option value="">Select one…</option>
                  {dealership.businessTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Location" required hint="City, district">
              {(id) => (
                <input id={id} type="text" required maxLength={160} value={values.location} onChange={(e) => set('location')(e.target.value)} />
              )}
            </Field>
          </div>
        </>
      )}

      {type === 'support' && (
        <>
          <Field label="Which product?">
            {(id) => (
              <select id={id} value={values.product} onChange={(e) => set('product')(e.target.value)}>
                <option value="">Select one…</option>
                {products.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
                <option value="other">Something else</option>
              </select>
            )}
          </Field>
          <div className="field-row">
            <Field label="Where did you buy it?" hint="Shop and town">
              {(id) => (
                <input id={id} type="text" maxLength={160} value={values.boughtAt} onChange={(e) => set('boughtAt')(e.target.value)} />
              )}
            </Field>
            <Field label="Date or batch on the pack" hint="If you can read it">
              {(id) => (
                <input id={id} type="text" maxLength={80} value={values.packDetails} onChange={(e) => set('packDetails')(e.target.value)} />
              )}
            </Field>
          </div>
        </>
      )}

      {type === 'customer' && (
        <Field label="Subject">
          {(id) => (
            <input id={id} type="text" maxLength={160} value={values.subject} onChange={(e) => set('subject')(e.target.value)} />
          )}
        </Field>
      )}

      <Field
        label={type === 'dealer' ? 'Anything else?' : type === 'support' ? 'What happened?' : 'Message'}
        required={type !== 'dealer'}
        hint={type === 'dealer' ? 'A bit about your business or experience' : undefined}
      >
        {(id) => (
          <textarea id={id} rows={type === 'dealer' ? 3 : 5} required={type !== 'dealer'} maxLength={4000} value={values.message} onChange={(e) => set('message')(e.target.value)} />
        )}
      </Field>

      {/* Not for people: robots fill every box they find. */}
      <div className="trap" aria-hidden="true">
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
        </label>
      </div>

      {status.step === 'writing' && status.problem && (
        <p className="form-problem" role="alert">
          {status.problem}
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-wide" disabled={sending}>
        {sending ? 'Sending…' : connected ? words.send : 'Send by email'}
      </button>
      <p className="form-note">
        {type === 'dealer' ? 'Phone is needed' : 'A phone number or an email is needed'} so we can answer. We use your
        details only for that.
      </p>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && <span className="field__required"> (needed)</span>}
        {hint && <span className="field__hint">{hint}</span>}
      </label>
      {children(id)}
    </div>
  );
}
