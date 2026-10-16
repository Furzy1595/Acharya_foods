import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { content } from '../content';
import { Heading } from '../components/Heading';
import { InquiryForm } from '../components/InquiryForm';
import { ContactDetails } from './Home';

export function Contact() {
  const { contact, nepali } = content;
  const [params] = useSearchParams();
  // Read after the page has loaded: the saved HTML file is the same for every visitor.
  const [productSlug, setProductSlug] = useState<string>();
  useEffect(() => setProductSlug(params.get('product') ?? undefined), [params]);

  return (
    <section className="section page-top">
      <div className="container split">
        <div>
          <Heading as="h1" np={nepali?.contact}>
            {contact.title}
          </Heading>
          <p className="lead">{contact.intro}</p>
          <ContactDetails />
          <p className="aside-note">
            A problem with something you bought? <Link to="/support/">Tell us here</Link>. Want to sell our products?{' '}
            <Link to="/dealership/">Apply for dealership</Link>.
          </p>
        </div>
        <div className="form-card">
          <h2>Send a message</h2>
          <InquiryForm type="customer" productSlug={productSlug} />
        </div>
      </div>
    </section>
  );
}
