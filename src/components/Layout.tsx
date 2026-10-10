import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { content, digits } from '../content';
import { seoFor } from '../seo';
import { CloseIcon, JarMark, MailIcon, MenuIcon, PhoneIcon, PinIcon } from './Icons';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/#story', label: 'Our story', hash: true },
  { to: '/products/', label: 'Products' },
  { to: '/dealership/', label: 'Dealership' },
  { to: '/support/', label: 'Support' },
  { to: '/contact/', label: 'Contact' },
];

export function Layout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { site, contact, social } = content;

  // New page: close the phone menu, set the tab title, go to the top (or to the part asked for).
  useEffect(() => {
    setMenuOpen(false);
    const seo = seoFor(location.pathname);
    document.title = seo.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', seo.description);
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) {
        target.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  const socials = [
    { label: 'Facebook', url: social.facebook },
    { label: 'Instagram', url: social.instagram },
    { label: 'TikTok', url: social.tiktok },
    { label: 'WhatsApp', url: contact.whatsapp ? `https://wa.me/${digits(contact.whatsapp).replace('+', '')}` : '' },
  ].filter((s) => s.url);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to the page
      </a>
      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="brand">
            <JarMark />
            <span className="brand__text">
              <span className="brand__name">{site.name}</span>
              <span className="brand__place">
                {site.place}, since {site.established}
              </span>
            </span>
          </Link>
          <button
            type="button"
            className="menu-button"
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
            <span className="visually-hidden">{menuOpen ? 'Close menu' : 'Open menu'}</span>
          </button>
          <nav id="site-nav" className={`site-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main">
            <ul>
              {NAV.map((item) => (
                <li key={item.to}>
                  {item.hash ? (
                    <Link to={item.to} onClick={() => setMenuOpen(false)}>
                      {item.label}
                    </Link>
                  ) : (
                    <NavLink to={item.to} end={item.end}>
                      {item.label}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container site-footer__grid">
          <div>
            <p className="site-footer__name">{site.name}</p>
            <p>{site.footerBlurb}</p>
            {socials.length > 0 && (
              <ul className="site-footer__social">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.url} rel="noopener">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <nav aria-label="Footer">
            <h2 className="site-footer__heading">Quick links</h2>
            <ul className="site-footer__links">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="site-footer__heading">Contact</h2>
            <ul className="site-footer__contact">
              <li>
                <PinIcon />
                <span>{contact.addressLine}</span>
              </li>
              <li>
                <PhoneIcon />
                <a href={`tel:${digits(contact.phone)}`}>{contact.phone}</a>
              </li>
              <li>
                <MailIcon />
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="container site-footer__bottom">
          <span>
            © {__BUILD_YEAR__} {site.name}. All rights reserved.
          </span>
          <span>{site.footerNote}</span>
        </div>
      </footer>
    </>
  );
}
