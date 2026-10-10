import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { content, digits } from '../content';
import { seoFor } from '../seo';
import { CloseIcon, MenuIcon, PhoneIcon } from './Icons';

const NAV = [
  { to: '/products/', label: 'Products' },
  { to: '/#story', label: 'Our story', hash: true },
  { to: '/dealership/', label: 'Dealership' },
  { to: '/support/', label: 'Support' },
  { to: '/contact/', label: 'Contact' },
];

export function Layout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { site, contact, social } = content;
  const tel = `tel:${digits(contact.phone)}`;

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
      <div className="dhaka dhaka--top" aria-hidden="true" />
      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="brand">
            <span className="brand__name">{site.name}</span>
            {site.placeNp && (
              <span className="brand__place" lang="ne">
                {site.placeNp}
              </span>
            )}
          </Link>
          <nav id="site-nav" className={`site-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main">
            <ul>
              {NAV.map((item) => (
                <li key={item.to}>
                  {item.hash ? (
                    <Link to={item.to} onClick={() => setMenuOpen(false)}>
                      {item.label}
                    </Link>
                  ) : (
                    <NavLink to={item.to}>{item.label}</NavLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div className="site-header__actions">
            <a className="call-button" href={tel}>
              <PhoneIcon />
              <span className="call-button__word">Call</span>
              <span className="call-button__number">{contact.phone}</span>
            </a>
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
          </div>
        </div>
      </header>

      <main id="main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="dhaka dhaka--footer" aria-hidden="true" />
        <div className="container site-footer__grid">
          <div>
            <p className="site-footer__name">{site.name}</p>
            <p>{site.footerBlurb}</p>
          </div>
          <nav aria-label="Footer">
            <ul className="site-footer__links">
              <li>
                <Link to="/">Home</Link>
              </li>
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <ul className="site-footer__contact">
            <li>{contact.addressLine}</li>
            <li>
              <a href={tel}>{contact.phone}</a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.url} rel="noopener">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
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
