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
    title: string;
    description: string;
    keywords: string;
    footerBlurb: string;
    footerNote: string;
  };
  api: { baseUrl: string };
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
  home: {
    hero: { title: string; subtitle: string; body: string; image: string; imageAlt: string };
    story: { title: string; paragraphs: string[]; note: string; image: string; imageAlt: string };
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

export const content = raw as SiteContent;
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
