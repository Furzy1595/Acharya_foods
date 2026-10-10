# Acharya Foods website

The public website of Acharya Foods Udhog, [acharyafoods.com.np](https://acharyafoods.com.np).

Built with React and TypeScript (Vite). Every page is written out as a finished HTML file when
the site is built, so it loads fast on a phone, search engines read real text, and the site
stays online when the office computer is off.

## Where the words and pictures come from

Not from the code. Everything the site says and shows is in two places:

| What | Where |
|------|-------|
| Wording, products, prices, contact details, questions and answers | `content/site.json` |
| Photos | `content/media/` |

The Acharya Foods business system writes these when somebody presses **Publish to website**
there. Do not edit wording in `src/`. The format is described in
[`docs/CONNECTING.md`](docs/CONNECTING.md).

## Messages from visitors

The contact form, the dealership application and the support form send what the visitor wrote
to the business system (`api.baseUrl` in `content/site.json`). If the system cannot be reached,
the visitor is told so and offered the same message by email, WhatsApp or phone - nothing is
dropped silently. While `api.baseUrl` is empty, the forms open the visitor's email app with the
message filled in.

## Working on it

```
npm install
npm run dev        # the site on http://localhost:5173, reloads as you edit
npm run build      # the finished site in dist/
npm test           # opens every page and sends every form in a real browser
```

To try the forms against a business system on your own computer:
`VITE_API_BASE=http://localhost:8790 npm run dev`

## Publishing

Anything that reaches the `main` branch is built and published by
`.github/workflows/deploy.yml`. In the repository settings, **Pages -> Source** must be
**GitHub Actions**.

| Folder | What is in it |
|--------|---------------|
| `content/` | What the site says and shows (written by the business system) |
| `src/pages/` | One file per kind of page |
| `src/components/` | Header and footer, product card, forms, pictures |
| `src/lib/api.ts` | Sending a message to the business system |
| `src/seo.ts` | Page titles, descriptions and link previews |
| `scripts/images.mjs` | Shrinks the photos for phones |
| `scripts/prerender.mjs` | Writes one HTML file per page, the 404 page and the sitemap |
| `tests/` | The browser checks |
