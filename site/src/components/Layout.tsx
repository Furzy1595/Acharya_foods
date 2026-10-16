import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import scene from '../assets/nepal-footer.svg';
import { categories, content, digits } from '../content';
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

  // Escape closes the phone menu.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

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
            <img src={logo} alt={`${site.name}, home`} width={900} height={591} />
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
        <div className="container site-footer__grid">
          <div>
            <img className="site-footer__logo" src={logo} alt={site.name} width={900} height={591} loading="lazy" />
            <p>{site.footerBlurb}</p>
            {site.taglineNp && (
              <p className="site-footer__np" lang="ne">
                {site.taglineNp}
              </p>
            )}
          </div>
          <nav aria-label="Footer">
            <h2 className="site-footer__heading">Explore</h2>
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
          <nav aria-label="Our products">
            <h2 className="site-footer__heading">Our products</h2>
            <ul className="site-footer__links site-footer__links--one">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link to={`/products/category/${c.slug}/`}>{c.seoName ?? c.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="site-footer__heading">Get in touch</h2>
            <p>
              Give us a call or WhatsApp us at <a href={tel}>{contact.phone}</a>
            </p>
            <p>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </p>
            <p>{contact.addressLine}</p>
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
        </div>
        <img className="site-footer__scene" src={scene} alt="" aria-hidden="true" loading="lazy" />
        <div className="site-footer__bottom">
          <div className="container site-footer__bottom-inner">
            <span>
              © {__BUILD_YEAR__} {site.name}. All rights reserved.
            </span>
            <span>Made with care in Chitwan, Nepal</span>
          </div>
        </div>
      </footer>

      {/* Phones: the two things people come for, always under the thumb. */}
      <nav className="mobile-bar" aria-label="Quick contact">
        <a className="mobile-bar__call" href={tel}>
          <PhoneIcon /> Call us
        </a>
        <Link className="mobile-bar__msg" to={location.pathname.startsWith('/dealership') ? '/contact/' : '/dealership/'}>
          {location.pathname.startsWith('/dealership') ? 'Send a message' : 'Become a dealer'}
        </Link>
      </nav>
    </>
  );
}
