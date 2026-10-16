// Everything the website says and shows comes from content/site.json.
// That file is written by the business system when somebody presses
// "Publish to website" there (see docs/CONNECTING.md). Do not edit wording here.
import raw from '../content/site.json';
import mediaRaw from './generated/media.json';

export interface Product {
  id: number;
  slug: string;
  name: string;
  nameNp?: string;
  category: string;
  /** Price in rupees; leave out to show no price. */
  price?: number | null;
  /** For example "400 g jar". */
  pack?: string;
  /** A short line above the name on the product's page, e.g. "Our best-seller". */
  badge?: string;
  /** What goes into it, shown as small labels on the product's page. */
  ingredients?: { np: string; text: string }[];
  image?: string;
  description: string;
}

export interface Category {
  slug: string;
  name: string;
}

export interface SiteContent {
  schemaVersion: number;
  publishedAt: string;
  site: {
    name: string;
    url: string;
    established: number;
    place: string;
    /** The place in Nepali, shown under the name. Optional. */
    placeNp?: string;
    /** A short Nepali line under the name in the footer. */
    taglineNp?: string;
    title: string;
    description: string;
    keywords: string;
    footerBlurb: string;
    footerNote: string;
  };
  api: { baseUrl: string };
  /** Where form messages go by email while the business system is not linked. */
  forms?: { sendTo: string; relay: string };
  contact: {
    addressName: string;
    addressLine: string;
    phone: string;
    whatsapp: string;
    email: string;
    title: string;
    intro: string;
  };
  social: { facebook: string; instagram: string; tiktok: string };
  /** Short Nepali lines shown beside the English headings. Leave one out and only English shows. */
  nepali?: { products?: string; story?: string; dealership?: string; support?: string; contact?: string };
  home: {
    hero: {
      eyebrowNp?: string;
      /** The giant Nepali word, and the Nepali line under it. */
      bigNp: string;
      restNp?: string;
      title: string;
      body: string;
      image: string;
      imageAlt: string;
      photoCaptionNp?: string;
      /** The round stamp beside the photo: two Nepali lines and the text around the edge. */
      stampNp?: string[];
      stampText?: string;
    };
    story: { lead: string; title: string; paragraphs: string[]; steps: { np: string; text: string }[] };
  };
  categories: Category[];
  products: Product[];
  dealership: {
    title: string;
    intro: string;
    benefits: { title: string; text: string }[];
    formTitle: string;
    formIntro: string;
    businessTypes: { value: string; label: string }[];
  };
  support: {
    title: string;
    intro: string;
    faqs: { question: string; answer: string }[];
  };
}

export interface MediaInfo {
  width: number;
  height: number;
  variants: { w: number; src: string }[];
  share: string;
}

/** Small typographic care for every line of content: real apostrophes, and a dash never starts a line. */
function polish<T>(value: T): T {
  if (typeof value === 'string') {
    return value.replace(/(\p{L})'(\p{L})/gu, '$1\u2019$2').replace(/ — /g, '\u00a0— ') as T;
  }
  if (Array.isArray(value)) return value.map(polish) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, k === 'slug' || k === 'image' || k === 'baseUrl' || k === 'url' || k === 'email' ? v : polish(v)])) as T;
  }
  return value;
}

export const content = polish(raw as SiteContent);
export const media = mediaRaw as Record<string, MediaInfo>;

export const products = content.products;

/** Categories that have at least one product, in the order set in the business system. */
export const categories = content.categories.filter((c) => products.some((p) => p.category === c.slug));

export function categoryName(slug: string): string {
  return content.categories.find((c) => c.slug === slug)?.name ?? slug;
}

export function findProduct(slug: string | undefined): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/** 2006 -> २००६ */
export function npDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => '०१२३४५६७८९'[Number(d)]);
}

export function formatPrice(price: number | null | undefined): string | null {
  if (price === null || price === undefined) return null;
  return `रु ${price.toLocaleString('en-IN')}`;
}

/** Digits only, for tel: and wa.me links. */
export function digits(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

/** Every address of the site, used to write one HTML file per page. */
export function allRoutes(): string[] {
  return [
    '/',
    '/products/',
    ...categories.map((c) => `/products/category/${c.slug}/`),
    ...products.map((p) => `/products/${p.slug}/`),
    '/dealership/',
    '/support/',
    '/contact/',
  ];
}
