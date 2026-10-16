import { categoryName, content, findProduct, formatPrice, media, products } from './content';

export interface Seo {
  title: string;
  description: string;
  path: string;
  image?: string;
  jsonLd?: object;
  notFound?: boolean;
}

const { site, contact } = content;
const abs = (path: string) => site.url.replace(/\/$/, '') + path;
const share = (file?: string) => (file && media[file] ? abs(media[file].share) : undefined);

/** Title, description and link preview for an address of the site. */
export function seoFor(pathname: string): Seo {
  const path = pathname.endsWith('/') ? pathname : pathname + '/';
  const parts = path.split('/').filter(Boolean);
  const heroImage = share(content.home.hero.image);

  if (parts.length === 0) {
    return {
      title: site.title,
      description: site.description,
      path: '/',
      image: heroImage,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: site.name,
        description: site.description,
        url: site.url,
        telephone: contact.phone,
        email: contact.email,
        image: heroImage,
        address: {
          '@type': 'PostalAddress',
          streetAddress: contact.addressLine.split(',')[0],
          addressLocality: 'Chitwan',
          addressCountry: 'NP',
        },
        foundingDate: String(site.established),
        ...priceRange(),
      },
    };
  }

  if (parts[0] === 'products' && parts.length === 1) {
    return {
      title: `Our products — ${site.name}`,
      description: `Everything ${site.name} makes in ${site.place}: ${listNames()}.`,
      path,
      image: heroImage,
    };
  }

  if (parts[0] === 'products' && parts[1] === 'category' && parts[2]) {
    const inCategory = products.filter((p) => p.category === parts[2]);
    if (inCategory.length > 0) {
      const name = categoryName(parts[2]);
      return {
        title: `${name} — ${site.name}`,
        description: `${name} from ${site.name}, ${site.place}: ${inCategory.map((p) => p.name).join(', ')}.`,
        path,
        image: share(inCategory[0].image) ?? heroImage,
      };
    }
  }

  if (parts[0] === 'products' && parts.length === 2) {
    const product = findProduct(parts[1]);
    if (product) {
      const price = formatPrice(product.price);
      const image = share(product.image);
      return {
        title: `${product.name}${product.nameNp ? ` (${product.nameNp})` : ''} — ${site.name}`,
        description: product.description,
        path,
        image: image ?? heroImage,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          ...(product.nameNp ? { alternateName: product.nameNp } : {}),
          description: product.description,
          category: categoryName(product.category),
          brand: { '@type': 'Brand', name: site.name },
          ...(image ? { image } : {}),
          ...(price
            ? {
                offers: {
                  '@type': 'Offer',
                  price: product.price,
                  priceCurrency: 'NPR',
                  url: abs(path),
                },
              }
            : {}),
        },
      };
    }
  }

  if (parts[0] === 'dealership' && parts.length === 1) {
    return {
      title: `Become a dealer — ${site.name}`,
      description: content.dealership.intro,
      path,
      image: heroImage,
    };
  }

  if (parts[0] === 'support' && parts.length === 1) {
    return {
      title: `Support — ${site.name}`,
      description: content.support.intro,
      path,
      image: heroImage,
      ...(content.support.faqs.length > 0
        ? {
            jsonLd: {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: content.support.faqs.map((f) => ({
                '@type': 'Question',
                name: f.question,
                acceptedAnswer: { '@type': 'Answer', text: f.answer },
              })),
            },
          }
        : {}),
    };
  }

  if (parts[0] === 'contact' && parts.length === 1) {
    return {
      title: `Contact — ${site.name}`,
      description: contact.intro,
      path,
      image: heroImage,
    };
  }

  return {
    title: `Page not found — ${site.name}`,
    description: site.description,
    path,
    notFound: true,
  };
}

function listNames(): string {
  return products.map((p) => p.name).join(', ');
}

function priceRange(): { priceRange?: string } {
  const prices = products.map((p) => p.price).filter((p): p is number => typeof p === 'number');
  if (prices.length === 0) return {};
  return { priceRange: `रु ${Math.min(...prices)} - रु ${Math.max(...prices)}` };
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The <head> tags for a page, written into the HTML file when the site is built. */
export function headTags(seo: Seo): string {
  const url = abs(seo.path);
  const tags = [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    `<meta name="keywords" content="${esc(site.keywords)}" />`,
    seo.notFound ? `<meta name="robots" content="noindex" />` : `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    `<meta property="og:description" content="${esc(seo.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(site.name)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ];
  if (seo.image) {
    tags.push(`<meta property="og:image" content="${esc(seo.image)}" />`);
    tags.push(`<meta name="twitter:image" content="${esc(seo.image)}" />`);
  }
  if (seo.jsonLd) {
    tags.push(`<script type="application/ld+json">${JSON.stringify(seo.jsonLd).replace(/</g, '\\u003c')}</script>`);
  }
  return tags.join('\n    ');
}
