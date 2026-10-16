// What search engines and link previews read: title, description, canonical address,
// preview picture and structured data (schema.org) for every page.
import { categories, categoryName, content, findCategory, findProduct, media, products, type Product } from './content';

export interface Seo {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  jsonLd: object[];
  notFound?: boolean;
}

const { site, contact, social } = content;
const BASE = site.url.replace(/\/$/, '');
const abs = (path: string) => BASE + path;
const share = (file?: string) => (file && media[file] ? abs(media[file].share) : undefined);
const largest = (file?: string) => {
  const m = file ? media[file] : undefined;
  return m ? abs(m.variants[m.variants.length - 1].src) : undefined;
};
const ORG = `${BASE}/#organization`;
const SITE = `${BASE}/#website`;

/** Cut text at a word so it fits a search result (about 155 characters). */
function fit(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:—-]+$/, '') + '…';
}

/** "X | Acharya Foods", dropping the optional middle part when the title would run long. */
function title(main: string, extra?: string): string {
  const full = extra ? `${main} ${extra} | ${site.name}` : `${main} | ${site.name}`;
  return full.length <= 62 || !extra ? full : `${main} | ${site.name}`;
}

function organization(): object {
  const sameAs = [social.facebook, social.instagram, social.tiktok].filter(Boolean);
  const prices = products.map((p) => p.price).filter((p): p is number => typeof p === 'number');
  return {
    '@type': ['LocalBusiness', 'Organization'],
    '@id': ORG,
    name: site.name,
    alternateName: 'Acharya Foods Udhog',
    url: `${BASE}/`,
    logo: abs('/logo.png'),
    image: share(content.home.hero.image),
    description: site.description,
    foundingDate: String(site.established),
    telephone: contact.phone.replace(/\s+/g, '-'),
    email: contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.addressLine.split(',')[0].trim(),
      addressLocality: 'Ratnanagar',
      addressRegion: 'Chitwan',
      addressCountry: 'NP',
    },
    areaServed: { '@type': 'Country', name: 'Nepal' },
    ...(prices.length ? { priceRange: `NPR ${Math.min(...prices)}–${Math.max(...prices)}` } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

function website(): object {
  return { '@type': 'WebSite', '@id': SITE, url: `${BASE}/`, name: site.name, publisher: { '@id': ORG }, inLanguage: 'en' };
}

function breadcrumbs(trail: [string, string][]): object {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [['Home', '/'] as [string, string], ...trail].map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: abs(path),
    })),
  };
}

function productLd(p: Product, path: string): object {
  const image = [largest(p.image), share(p.image)].filter(Boolean);
  return {
    '@type': 'Product',
    '@id': `${abs(path)}#product`,
    name: p.name,
    ...(p.nameNp ? { alternateName: p.nameNp } : {}),
    description: p.description,
    category: categoryName(p.category),
    sku: `AF-${String(p.id).padStart(3, '0')}`,
    brand: { '@type': 'Brand', name: site.name },
    manufacturer: { '@id': ORG },
    countryOfOrigin: 'NP',
    ...(image.length ? { image } : {}),
    ...(typeof p.price === 'number'
      ? {
          offers: {
            '@type': 'Offer',
            price: p.price.toFixed(2),
            priceCurrency: 'NPR',
            itemCondition: 'https://schema.org/NewCondition',
            url: abs(path),
            seller: { '@id': ORG },
          },
        }
      : {}),
  };
}

function itemList(items: Product[]): object {
  return {
    '@type': 'ItemList',
    itemListElement: items.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`/products/${p.slug}/`), name: p.name })),
  };
}

/** Title, description, preview and structured data for an address of the site. */
export function seoFor(pathname: string): Seo {
  const path = pathname.endsWith('/') ? pathname : pathname + '/';
  const parts = path.split('/').filter(Boolean);
  const heroImage = share(content.home.hero.image);
  const base = [organization(), website()];
  const page = (type: string, name: string, extra: object = {}) => ({
    '@type': type,
    '@id': `${abs(path)}#webpage`,
    url: abs(path),
    name,
    isPartOf: { '@id': SITE },
    about: { '@id': ORG },
    inLanguage: 'en',
    ...extra,
  });

  if (parts.length === 0) {
    return {
      title: site.title,
      description: fit(site.description),
      path: '/',
      image: heroImage,
      imageAlt: content.home.hero.imageAlt,
      jsonLd: [...base, page('WebPage', site.title), itemList(products)],
    };
  }

  if (parts[0] === 'products' && parts.length === 1) {
    const t = title('All Products: Nepali Achar, Spices & Flour');
    return {
      title: t,
      description: fit(`Every product we make in Chitwan, Nepal: ${products.map((p) => p.name.toLowerCase()).join(', ')}. Handmade, no artificial colours or preservatives.`),
      path,
      image: heroImage,
      jsonLd: [...base, page('CollectionPage', t), breadcrumbs([['Products', '/products/']]), itemList(products)],
    };
  }

  if (parts[0] === 'products' && parts[1] === 'category' && parts[2]) {
    const category = findCategory(parts[2]);
    const inCategory = products.filter((p) => p.category === parts[2]);
    if (category && inCategory.length > 0) {
      const t = title(category.seoName ?? category.name, 'from Chitwan');
      return {
        title: t,
        description: fit(category.intro ? `${category.intro} ${inCategory.map((p) => p.name).join(', ')}.` : `${category.name} from ${site.name}: ${inCategory.map((p) => p.name).join(', ')}.`),
        path,
        image: share(inCategory[0].image) ?? heroImage,
        jsonLd: [
          ...base,
          page('CollectionPage', t),
          breadcrumbs([['Products', '/products/'], [category.name, path]]),
          itemList(inCategory),
        ],
      };
    }
  }

  if (parts[0] === 'products' && parts.length === 2) {
    const product = findProduct(parts[1]);
    if (product) {
      const category = findCategory(product.category);
      const t = title(`${product.name}${product.nameNp ? ` (${product.nameNp})` : ''}`, category?.seoTag || undefined);
      return {
        title: t,
        description: fit(`${product.description} Handmade by ${site.name} in Chitwan, Nepal${typeof product.price === 'number' ? ` — रु ${product.price}` : ''}.`),
        path,
        image: share(product.image) ?? heroImage,
        imageAlt: `${product.name} — ${site.name}`,
        jsonLd: [
          ...base,
          page('ItemPage', t, { mainEntity: { '@id': `${abs(path)}#product` } }),
          breadcrumbs([
            ['Products', '/products/'],
            [category?.name ?? categoryName(product.category), `/products/category/${product.category}/`],
            [product.name, path],
          ]),
          productLd(product, path),
        ],
      };
    }
  }

  if (parts[0] === 'dealership' && parts.length === 1) {
    const t = title('Become a Dealer or Distributor in Nepal');
    return {
      title: t,
      description: fit(`Stock Acharya Foods pickles, spices and flours in your shop. Fair dealer margins, reliable supply across Nepal from Terai to hills, and a direct line to us. Apply online.`),
      path,
      image: heroImage,
      jsonLd: [...base, page('WebPage', t), breadcrumbs([['Dealership', path]])],
    };
  }

  if (parts[0] === 'support' && parts.length === 1) {
    const t = title('Customer Support & Questions');
    return {
      title: t,
      description: fit(`${content.support.intro} Call ${contact.phone} or write to us.`),
      path,
      image: heroImage,
      jsonLd: [
        ...base,
        page('WebPage', t),
        breadcrumbs([['Support', path]]),
        ...(content.support.faqs.length > 0
          ? [
              {
                '@type': 'FAQPage',
                mainEntity: content.support.faqs.map((f) => ({
                  '@type': 'Question',
                  name: f.question,
                  acceptedAnswer: { '@type': 'Answer', text: f.answer },
                })),
              },
            ]
          : []),
      ],
    };
  }

  if (parts[0] === 'contact' && parts.length === 1) {
    const t = title('Contact Us', '– Ratnanagar, Chitwan, Nepal');
    return {
      title: t,
      description: fit(`Call ${contact.phone}, email ${contact.email} or visit us at ${contact.addressLine}. Questions about our pickles, spices and flours are welcome.`),
      path,
      image: heroImage,
      jsonLd: [...base, page('ContactPage', t), breadcrumbs([['Contact', path]])],
    };
  }

  return {
    title: `Page not found | ${site.name}`,
    description: fit(site.description),
    path,
    jsonLd: [],
    notFound: true,
  };
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The <head> tags for a page, written into the HTML file when the site is built. */
export function headTags(seo: Seo): string {
  const url = abs(seo.path);
  const tags = [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    `<meta name="keywords" content="${esc(site.keywords)}" />`,
    seo.notFound
      ? `<meta name="robots" content="noindex" />`
      : `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />\n    <link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    `<meta property="og:description" content="${esc(seo.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:type" content="${seo.path.startsWith('/products/') && seo.path.split('/').filter(Boolean).length === 2 ? 'product' : 'website'}" />`,
    `<meta property="og:site_name" content="${esc(site.name)}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(seo.title)}" />`,
    `<meta name="twitter:description" content="${esc(seo.description)}" />`,
  ];
  if (seo.image) {
    tags.push(`<meta property="og:image" content="${esc(seo.image)}" />`);
    tags.push(`<meta property="og:image:width" content="1200" />`, `<meta property="og:image:height" content="630" />`);
    if (seo.imageAlt) tags.push(`<meta property="og:image:alt" content="${esc(seo.imageAlt)}" />`);
    tags.push(`<meta name="twitter:image" content="${esc(seo.image)}" />`);
  }
  if (site.googleVerification) tags.push(`<meta name="google-site-verification" content="${esc(site.googleVerification)}" />`);
  if (site.bingVerification) tags.push(`<meta name="msvalidate.01" content="${esc(site.bingVerification)}" />`);
  if (seo.jsonLd.length) {
    const graph = { '@context': 'https://schema.org', '@graph': seo.jsonLd };
    tags.push(`<script type="application/ld+json">${JSON.stringify(graph).replace(/</g, '\\u003c')}</script>`);
  }
  return tags.join('\n    ');
}

export { categories };
