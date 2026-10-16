# Acharya Foods website

The public website of Acharya Foods Udhog, [acharyafoods.com.np](https://acharyafoods.com.np).

Built with React and TypeScript (Vite). Every page is written out as a finished HTML file when
the site is built, so it loads fast on a phone, search engines read real text, and the site
stays online when the office computer is off.

## Where the words and pictures come from

Not from the code. Everything the site says and shows is in two places:

| What | Where |
|------|-------|
| Wording, products, prices, contact details, questions and answers | `site/content/site.json` |
| Photos | `site/content/media/` |

The Acharya Foods business system writes these when somebody presses **Publish to website**
there. Do not edit wording in `site/src/`. The format is described in
[`docs/CONNECTING.md`](docs/CONNECTING.md).

## Messages from visitors

The contact form, the dealership application and the support form send what the visitor wrote:

1. to the business system, once it is linked (`api.baseUrl` in `site/content/site.json`);
2. until then, by email to `forms.sendTo` (acharyafoodsudhog@gmail.com) through
   [FormSubmit](https://formsubmit.co), a free form-to-email service. The applicant also gets a
   short confirmation email when they gave an address, and pressing Reply in Gmail answers them.

**One-time step:** the very first message makes FormSubmit send an "Activate Form" email to
acharyafoodsudhog@gmail.com. Press the button in it once; every later message arrives as a normal
email. Until it is activated, visitors are told the message was not sent and are offered email,
WhatsApp or phone with their words already filled in - nothing is dropped silently.

## Working on it

Everything below runs in the `site/` folder.

```
cd site
npm install
npm run dev        # the site on http://localhost:5173, reloads as you edit
npm run build      # the finished site in dist/
npm test           # opens every page and sends every form in a real browser
```

To try the forms against a business system on your own computer:
`VITE_API_BASE=http://localhost:8790 npm run dev`

## Publishing

`.github/workflows/deploy.yml` builds `site/` whenever anything in it changes on `main` and
publishes it. GitHub Pages is set to **Source: GitHub Actions** with the custom domain
acharyafoods.com.np (Settings -> Pages). The finished pages are also kept at the top of `main`
(listed in `.published-files`), so the site still works if the source is ever switched to
"Deploy from a branch: main, / (root)". Do not edit those files by hand.

| Folder | What is in it |
|--------|---------------|
| `site/content/` | What the site says and shows (written by the business system) |
| `site/src/pages/` | One file per kind of page |
| `site/src/components/` | Header and footer, product card, forms, pictures |
| `site/src/lib/api.ts` | Sending a message to the business system |
| `site/src/seo.ts` | Page titles, descriptions and link previews |
| `site/scripts/images.mjs` | Shrinks the photos for phones |
| `site/scripts/prerender.mjs` | Writes one HTML file per page, the 404 page and the sitemap |
| `site/tests/` | The browser checks |
