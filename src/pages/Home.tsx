import { useState } from 'react';
import { Link } from 'react-router-dom';
import { categories, content, digits, products } from '../content';
import { Heading } from '../components/Heading';
import { CheckIcon } from '../components/Icons';
import { Picture } from '../components/Picture';
import { ProductGrid } from '../components/ProductCard';

export function Home() {
  const { hero, story } = content.home;
  const { dealership, contact, nepali } = content;
  const [category, setCategory] = useState('all');
  const shown = category === 'all' ? products : products.filter((p) => p.category === category);

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__text">
            {hero.titleNp && (
              <p className="hero__np" lang="ne">
                {hero.titleNp}
              </p>
            )}
            <h1>{hero.title}</h1>
            <p className="lead">{hero.subtitle}</p>
            <p>{hero.body}</p>
            <div className="button-row">
              <Link to="/products/" className="btn btn-primary">
                See our products
              </Link>
              <Link to="/dealership/" className="btn btn-quiet">
                Become a dealer
              </Link>
            </div>
          </div>
          <div className="hero__photo">
            <Picture file={hero.image} alt={hero.imageAlt} sizes="(min-width: 900px) 600px, 100vw" eager />
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

      <section className="section section--rule story" id="story">
        <div className="container story__inner">
          <div className="story__photo">
            <Picture file={story.image} alt={story.imageAlt} sizes="(min-width: 900px) 400px, 90vw" />
          </div>
          <div className="story__text">
            <Heading np={nepali?.story}>{story.title}</Heading>
            {story.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p className="story__note">{story.note}</p>
          </div>
        </div>
      </section>

      <section className="section dealer-band" id="dealership">
        <div className="container dealer-band__inner">
          <div>
            <Heading np={nepali?.dealership}>{dealership.title}</Heading>
            <p>{dealership.intro}</p>
            <Benefits />
          </div>
          <div className="dealer-band__cta">
            <p className="lead">Fill out a quick application and we’ll get back to you within 48 hours.</p>
            <Link to="/dealership/" className="btn btn-primary">
              Apply for dealership
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="contact">
        <div className="container contact-strip">
          <div>
            <Heading np={nepali?.contact}>{contact.title}</Heading>
            <p>{contact.intro}</p>
          </div>
          <div className="contact-strip__actions">
            <a href={`tel:${digits(contact.phone)}`} className="btn btn-primary">
              Call {contact.phone}
            </a>
            <Link to="/contact/" className="btn btn-outline">
              Send a message
            </Link>
            <Link to="/support/" className="btn btn-quiet">
              Get help with a product
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function Benefits() {
  return (
    <ul className="benefits">
      {content.dealership.benefits.map((b) => (
        <li key={b.title}>
          <CheckIcon />
          <span>
            <strong>{b.title}</strong> — {b.text}
          </span>
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
