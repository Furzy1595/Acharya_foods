# Search engines: what the site does, and what only the owner can do

## Built into the site (checked by `npm test` in `site/`)

- Every page is finished HTML, so Google reads the full text without running scripts.
- Each page has its own title (at most 65 characters, search phrase first, brand last) and its
  own description (70–160 characters). Product titles carry the Nepali name too, e.g.
  "Mango Pickle (आँपको अचार) – Nepali Achar | Acharya Foods", because people search in both.
- Structured data (schema.org) on every page: the business (address in Ratnanagar, Chitwan,
  phone, email, logo, founding year, price range), the website, breadcrumbs, the product list,
  and on product pages the product with brand, picture and price in NPR. The support page carries
  its questions and answers.
- `sitemap.xml` lists every page with its photos and the build date; `robots.txt` points to it.
- Canonical address on every page; the "not found" page is marked not to be indexed.
- Large link previews on Facebook, WhatsApp and X (1200 × 630 picture per page).
- Fast: pictures in the size the screen needs, the main photo and headline fonts fetched first,
  every page reachable through normal links (no orphan pages).

Wording for search lives in `site/content/site.json`: `site.title`, `site.description`,
`site.keywords`, and per category `seoName`, `seoTag`, `intro`.

## Only the owner can do these — they matter most for ranking

1. **Google Search Console** (search.google.com/search-console): add the domain
   acharyafoods.com.np. Choose "HTML tag", copy the code in `content="…"` into
   `site.googleVerification`, publish, press Verify. Then Sitemaps → submit `sitemap.xml`,
   and URL inspection → "Request indexing" for the home page.
2. **Google Business Profile** (business.google.com): "Acharya Foods", category "Food products
   supplier" or "Pickle manufacturer", the same address, phone and website as on the site, opening
   hours and photos. This is what shows the business on Google Maps and for "near me" searches.
3. **Reviews**: ask dealers and regular customers to leave a Google review.
4. **Bing Webmaster Tools** (bing.com/webmasters): import from Search Console, or use the
   "HTML tag" code in `site.bingVerification`.
5. **The same name, address and phone everywhere**: Facebook page, Instagram, Daraz or other
   shops, directories. Put the Facebook / Instagram / TikTok addresses into `social` so the site
   links them and tells Google they belong together.
6. **Links from other sites**: dealers' pages, local news, Chitwan business directories,
   food blogs. Each one that links to acharyafoods.com.np helps.
7. **More words on product pages**: how to eat it, the jar size (`pack`), shelf life. Real,
   specific sentences rank better than short ones.

Ranking takes weeks, not days, after Search Console has the sitemap.
