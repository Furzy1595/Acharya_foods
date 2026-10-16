import { useState } from 'react';
import { Link } from 'react-router-dom';
import { categories, content, digits, npDigits, products } from '../content';
import { Heading } from '../components/Heading';
import { Picture } from '../components/Picture';
import { ProductGrid } from '../components/ProductCard';

export function Home() {
  const { hero, story } = content.home;
  const { dealership, contact, nepali, site } = content;
  const [category, setCategory] = useState('all');
  const shown = category === 'all' ? products : products.filter((p) => p.category === category);

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__text">
            {hero.eyebrowNp && (
              <p className="hero__eyebrow" lang="ne">
                {hero.eyebrowNp}
              </p>
            )}
            <h1 className="hero__title">
              <span className="hero__big" lang="ne">
                {hero.bigNp}
              </span>
              {hero.restNp && (
                <span className="hero__rest" lang="ne">
                  {hero.restNp}
                </span>
              )}
              <span className="hero__en">{hero.title}</span>
            </h1>
            <p className="hero__body">{hero.body}</p>
            <div className="button-row">
              <Link to="/products/" className="btn btn-primary">
                See our products
              </Link>
              <Link to="/dealership/" className="btn btn-outline">
                Become a dealer
              </Link>
            </div>
          </div>
          <div className="hero__photo">
            <figure className="print">
              <Picture file={hero.image} alt={hero.imageAlt} sizes="(min-width: 900px) 580px, 100vw" eager />
              {hero.photoCaptionNp && (
                <figcaption lang="ne">{hero.photoCaptionNp}</figcaption>
              )}
            </figure>
            {hero.stampNp && <Stamp lines={hero.stampNp} ring={hero.stampText ?? ''} />}
          </div>
        </div>
      </section>

      <section className="section" id="products">
        <div className="container">
          <div className="section-head">
            <Heading np={nepali?.products}>Our products</Heading>
            <div className="tabs" role="group" aria-label="Show one kind of product">
              <button type="button" className="tab" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>
                All
              </button>
              {categories.map((c) => (
                <button key={c.slug} type="button" className="tab" aria-pressed={category === c.slug} onClick={() => setCategory(c.slug)}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <ProductGrid items={shown} />
        </div>
      </section>

      <section className="section story" id="story">
        <div className="container story__inner">
          <div>
            <p className="story__year" lang="ne">
              {npDigits(site.established)}
            </p>
            <p className="story__lead">{story.lead}</p>
          </div>
          <div>
            <Heading np={nepali?.story}>{story.title}</Heading>
            {story.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
        {story.steps.length > 0 && (
          <div className="container">
            <ol className="steps">
              {story.steps.map((step, i) => (
                <li key={step.text}>
                  <span className="steps__n" lang="ne">
                    {npDigits(i + 1)}
                  </span>
                  <span className="steps__np" lang="ne">
                    {step.np}
                  </span>
                  <span className="steps__en">{step.text}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      <section className="section dealer-band" id="dealership">
        <div className="container dealer-band__inner">
          <div>
            <Heading np={nepali?.dealership}>{dealership.title}</Heading>
            <p>{dealership.intro.replace(/ Here.s what you get:?$/, '')}</p>
            <Link to="/dealership/" className="btn btn-bright">
              Apply for dealership
            </Link>
            <p className="dealer-band__note">We get back to you within 48 hours.</p>
          </div>
          <ul className="benefit-cards">
            {dealership.benefits.map((b) => (
              <li key={b.title}>
                <strong>{b.title}</strong>
                <span>{b.text.charAt(0).toUpperCase() + b.text.slice(1)}.</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" id="contact">
        <div className="container contact-strip">
          <div>
            <p className="contact-strip__namaste" lang="ne">
              {nepali?.contact ?? 'नमस्ते'}
            </p>
            <h2>{contact.title}</h2>
            <p>{contact.intro}</p>
          </div>
          <div className="contact-tiles">
            <a href={`tel:${digits(contact.phone)}`} className="tile tile--call">
              <span className="tile__label">Call us</span>
              <span className="tile__value">{contact.phone}</span>
            </a>
            <Link to="/contact/" className="tile tile--line">
              <span className="tile__label">Send a message</span>
              <span className="tile__value tile__value--small">{contact.email}</span>
            </Link>
            <div className="contact-tiles__pair">
              <Link to="/support/" className="tile tile--soft">
                <span className="tile__strong">Help with a product</span>
                <span className="tile__label">A damaged jar, a question</span>
              </Link>
              <div className="tile tile--grey">
                <span className="tile__strong">Visit us</span>
                <span className="tile__label">{contact.addressLine.replace(/, Nepal$/, '')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stamp({ lines, ring }: { lines: string[]; ring: string }) {
  return (
    <svg className="stamp" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <path id="stamp-ring" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" />
      </defs>
      <circle cx="100" cy="100" r="96" fill="#0E7A0C" />
      <circle cx="100" cy="100" r="86" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 5" />
      <text fontFamily="Mukta, sans-serif" fontWeight="700" fontSize="17" letterSpacing="3" fill="#FFFFFF">
        <textPath href="#stamp-ring">{`${ring} • ${ring} •`}</textPath>
      </text>
      {lines.map((line, i) => (
        <text key={line} x="100" y={lines.length === 1 ? 112 : 94 + i * 34} textAnchor="middle" fontFamily="Kalam, cursive" fontWeight="700" fontSize={i === 0 ? 34 : 30} fill="#FFFFFF">
          {line}
        </text>
      ))}
    </svg>
  );
}

export function Benefits() {
  return (
    <ul className="benefit-cards benefit-cards--light">
      {content.dealership.benefits.map((b) => (
        <li key={b.title}>
          <strong>{b.title}</strong>
          <span>{b.text.charAt(0).toUpperCase() + b.text.slice(1)}.</span>
        </li>
      ))}
    </ul>
  );
}

export function ContactDetails() {
  const { contact } = content;
  return (
    <dl className="contact-details">
      <div>
        <dt>Visit us</dt>
        <dd>
          {contact.addressName}, {contact.addressLine}
        </dd>
      </div>
      <div>
        <dt>Call us</dt>
        <dd>
          <a href={`tel:${digits(contact.phone)}`}>{contact.phone}</a>
        </dd>
      </div>
      <div>
        <dt>Email us</dt>
        <dd>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </dd>
      </div>
    </dl>
  );
}
