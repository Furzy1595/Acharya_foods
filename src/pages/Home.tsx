import { useState } from 'react';
import { Link } from 'react-router-dom';
import { categories, content, digits, products } from '../content';
import { CheckIcon, MailIcon, PhoneIcon, PinIcon } from '../components/Icons';
import { Picture } from '../components/Picture';
import { ProductGrid } from '../components/ProductCard';

export function Home() {
  const { hero, story } = content.home;
  const { dealership, contact } = content;
  const [category, setCategory] = useState('all');
  const shown = category === 'all' ? products : products.filter((p) => p.category === category);

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__text">
            <h1>{hero.title}</h1>
            <p className="hero__subtitle">{hero.subtitle}</p>
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
            <Picture file={hero.image} alt={hero.imageAlt} sizes="(min-width: 900px) 620px, 100vw" eager />
          </div>
        </div>
      </section>

      <section className="section story" id="story">
        <div className="container story__inner">
          <div className="story__photo">
            <Picture file={story.image} alt={story.imageAlt} sizes="(min-width: 900px) 440px, 90vw" />
          </div>
          <div className="story__text">
            <h2>{story.title}</h2>
            {story.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p className="story__note">{story.note}</p>
          </div>
        </div>
      </section>

      <section className="section section--tint" id="products">
        <div className="container">
          <div className="section-head">
            <h2>Our products</h2>
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

      <section className="section dealer-band" id="dealership">
        <div className="container dealer-band__inner">
          <div>
            <h2>{dealership.title}</h2>
            <p>{dealership.intro}</p>
            <ul className="benefits">
              {dealership.benefits.map((b) => (
                <li key={b.title}>
                  <CheckIcon />
                  <span>
                    <strong>{b.title}</strong> — {b.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="dealer-band__cta">
            <h3>Interested? Let's talk.</h3>
            <p>Fill out a quick application and we'll get back to you within 48 hours.</p>
            <Link to="/dealership/" className="btn btn-turmeric">
              Apply for dealership
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="contact">
        <div className="container contact-strip">
          <div>
            <h2>{contact.title}</h2>
            <p>{contact.intro}</p>
            <div className="button-row">
              <Link to="/contact/" className="btn btn-primary">
                Send a message
              </Link>
              <Link to="/support/" className="btn btn-outline">
                Get help with a product
              </Link>
            </div>
          </div>
          <ContactDetails />
        </div>
      </section>
    </>
  );
}

export function ContactDetails() {
  const { contact } = content;
  return (
    <dl className="contact-details">
      <div>
        <dt>
          <PinIcon /> Visit us
        </dt>
        <dd>
          {contact.addressName}
          <br />
          {contact.addressLine}
        </dd>
      </div>
      <div>
        <dt>
          <PhoneIcon /> Call us
        </dt>
        <dd>
          <a href={`tel:${digits(contact.phone)}`}>{contact.phone}</a>
        </dd>
      </div>
      <div>
        <dt>
          <MailIcon /> Email us
        </dt>
        <dd>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </dd>
      </div>
    </dl>
  );
}
