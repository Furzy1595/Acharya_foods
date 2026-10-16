// Checks the built website the way a visitor uses it, in a real browser.
//   npm test
// Builds the site twice (linked to a stand-in business system, and not linked),
// then opens every page on a phone and a computer, sends every form and runs
// a standard accessibility check (axe, WCAG 2 A and AA).
import { chromium } from 'playwright-core';
import { execSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serveDist } from './serve.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const content = JSON.parse(fs.readFileSync(path.join(root, 'content/site.json'), 'utf8'));
const axeSource = fs.readFileSync(path.join(root, 'node_modules/axe-core/axe.min.js'), 'utf8');
const API_PORT = 8791;
const results = [];
let failed = 0;

async function check(name, fn) {
  try {
    const note = await fn();
    results.push({ name, ok: true, note: note ?? '' });
    console.log(`  ok    ${name}${note ? ` — ${note}` : ''}`);
  } catch (error) {
    failed += 1;
    results.push({ name, ok: false, note: String(error.message ?? error).split('\n')[0] });
    console.log(`  FAIL  ${name}\n        ${String(error.message ?? error).split('\n').join('\n        ')}`);
  }
}
const expect = (condition, message) => {
  if (!condition) throw new Error(message);
};

function build(env = {}) {
  execSync('npm run build', { cwd: root, stdio: 'pipe', env: { ...process.env, ...env } });
}

/** Stand-in for the business system: remembers what it was sent, answers as told. */
function startApi() {
  const state = { mode: 'accept', received: [], preflights: 0 };
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
  const server = http.createServer((req, res) => {
    if (req.method === 'OPTIONS') {
      state.preflights += 1;
      return res.writeHead(204, cors).end();
    }
    if (req.method === 'POST' && req.url === '/api/public/inquiries') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        state.received.push(JSON.parse(body));
        if (state.mode === 'refuse') {
          res.writeHead(429, { ...cors, 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Too many messages from this address. Try again in a few minutes.' }));
        }
        if (state.mode === 'broken') return res.writeHead(502, cors).end('bad gateway');
        res.writeHead(201, { ...cors, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, reference: `WEB-${String(state.received.length).padStart(6, '0')}` }));
      });
      return;
    }
    res.writeHead(404, cors).end();
  });
  return new Promise((resolve) => server.listen(API_PORT, '127.0.0.1', () => resolve({ server, state })));
}

const executablePath = process.env.CHROME || undefined;
const browser = await chromium.launch(executablePath ? { executablePath } : {});

async function open(base, url, viewport = { width: 1280, height: 800 }) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const problems = [];
  page.on('console', (m) => m.type() === 'error' && problems.push(m.text()));
  page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
  const response = await page.goto(base + url, { waitUntil: 'load' });
  await page.waitForTimeout(250);
  return { page, context, problems, status: response.status() };
}

const routes = [
  '/',
  '/products/',
  ...content.categories.map((c) => `/products/category/${c.slug}/`),
  ...content.products.map((p) => `/products/${p.slug}/`),
  '/dealership/',
  '/support/',
  '/contact/',
];
const field = (page, label) => page.getByLabel(label, { exact: false });

// ---------------------------------------------------------------- linked to the business system
console.log('\nBuilding the site linked to a stand-in business system…');
build({ VITE_API_BASE: `http://127.0.0.1:${API_PORT}` });
let site = await serveDist();
const api = await startApi();

console.log('\nPages');
await check(`all ${routes.length} pages open, each with its own title, one main heading and no browser errors`, async () => {
  const titles = new Set();
  for (const url of routes) {
    const { page, context, problems, status } = await open(site.url, url);
    expect(status === 200, `${url} answered ${status}`);
    const title = await page.title();
    expect(!titles.has(title), `${url} repeats the title "${title}"`);
    titles.add(title);
    expect((await page.locator('h1').count()) === 1, `${url} has ${await page.locator('h1').count()} main headings`);
    const canonical = await page.locator('link[rel=canonical]').getAttribute('href');
    expect(canonical === content.site.url + url, `${url} canonical is ${canonical}`);
    expect(problems.length === 0, `${url}: ${problems.join(' | ')}`);
    await context.close();
  }
});

await check('the text is in the HTML file itself (readable without JavaScript, for search engines and slow phones)', async () => {
  const html = fs.readFileSync(path.join(root, 'dist/products/mango-pickle/index.html'), 'utf8');
  expect(html.includes('आँपको अचार') && html.includes('Our best-seller'), 'product text missing from the saved page');
  expect(html.includes('"@type":"Product"'), 'product details for search engines missing');
  const sitemap = fs.readFileSync(path.join(root, 'dist/sitemap.xml'), 'utf8');
  expect(routes.every((r) => sitemap.includes(`${content.site.url}${r}<`)), 'sitemap misses a page');
});

await check('an address that does not exist shows the "not here" page with a way back', async () => {
  const { page, context, status } = await open(site.url, '/no-such-page/');
  expect(status === 404, `answered ${status}`);
  expect(await page.getByRole('heading', { name: 'This page is not here' }).isVisible(), 'heading missing');
  await page.getByRole('link', { name: 'See our products' }).first().click();
  await page.waitForURL('**/products/');
  await context.close();
});

await check('nothing is wider than the screen at 360, 390, 768, 1024 and 1440 px', async () => {
  const kinds = ['/', '/products/', '/products/mixed-vegetable-pickle/', '/dealership/', '/support/', '/contact/'];
  for (const width of [360, 390, 768, 1024, 1440]) {
    for (const url of kinds) {
      const { page, context } = await open(site.url, url, { width, height: 800 });
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(over <= 0, `${url} at ${width}px is ${over}px too wide`);
      const small = await page.evaluate(() =>
        [...document.querySelectorAll('input:not([tabindex="-1"]):not([type=checkbox]), select, textarea')].filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16).length,
      );
      expect(small === 0, `${url} at ${width}px has ${small} boxes that make an iPhone zoom`);
      await context.close();
    }
  }
});

await check('accessibility check (axe, WCAG 2 A and AA) on every kind of page, phone and computer', async () => {
  let checked = 0;
  for (const viewport of [{ width: 390, height: 800 }, { width: 1280, height: 800 }]) {
    for (const url of ['/', '/products/', '/products/chatpat-masala/', '/dealership/', '/support/', '/contact/', '/no-such-page/']) {
      const { page, context } = await open(site.url, url, viewport);
      await page.evaluate(axeSource);
      const found = await page.evaluate(() => window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }));
      const list = found.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0].target.join(' ')}`);
      expect(list.length === 0, `${url} at ${viewport.width}px: ${list.join('; ')}`);
      checked += 1;
      await context.close();
    }
  }
  return `${checked} page views`;
});

console.log('\nFinding things');
await check('home page: choosing "Pickles" shows only the pickles; a product opens its own page', async () => {
  const { page, context } = await open(site.url, '/');
  const pickles = content.products.filter((p) => p.category === 'pickles');
  await page.getByRole('button', { name: 'Pickles' }).click();
  expect((await page.locator('.product-card').count()) === pickles.length, 'wrong number of pickles');
  await page.getByRole('link', { name: new RegExp(pickles[0].name) }).first().click();
  await page.waitForURL(`**/products/${pickles[0].slug}/`);
  await page.getByRole('heading', { level: 1, name: pickles[0].name }).waitFor();
  await page.waitForFunction((name) => document.title.startsWith(name), pickles[0].name);
  await context.close();
});

await check('phone: the menu opens, goes to Dealership and closes itself', async () => {
  const { page, context } = await open(site.url, '/', { width: 390, height: 800 });
  expect(!(await page.locator('#site-nav').isVisible()), 'menu should start closed');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('#site-nav').getByRole('link', { name: 'Dealership' }).click();
  await page.getByRole('heading', { level: 1, name: content.dealership.title }).waitFor();
  expect(!(await page.locator('#site-nav').isVisible()), 'menu stayed open');
  await context.close();
});

await check('phones get a Call / Become a dealer bar at the bottom that never hides the page; computers do not', async () => {
  const phone = await open(site.url, '/', { width: 390, height: 800 });
  const bar = phone.page.locator('.mobile-bar');
  expect(await bar.isVisible(), 'bar missing on a phone');
  expect((await bar.getByRole('link', { name: 'Call us' }).getAttribute('href')).startsWith('tel:'), 'Call is not a phone link');
  const covered = await phone.page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
    const footerBottom = document.querySelector('.site-footer__bottom').getBoundingClientRect().bottom;
    return footerBottom - document.querySelector('.mobile-bar').getBoundingClientRect().top;
  });
  expect(covered <= 1, `the bar covers ${covered}px of the page end`);
  await phone.context.close();
  const desk = await open(site.url, '/', { width: 1280, height: 800 });
  expect(!(await desk.page.locator('.mobile-bar').isVisible()), 'bar shows on a computer');
  await desk.context.close();
});

await check('"Our story" in the menu goes to the story on the home page, also from another page', async () => {
  const { page, context } = await open(site.url, '/contact/');
  await page.locator('#site-nav').getByRole('link', { name: 'Our story' }).click();
  await page.waitForURL('**/#story');
  await page.waitForTimeout(300);
  const top = await page.locator('#story').evaluate((el) => el.getBoundingClientRect().top);
  expect(top >= 0 && top < 400, `story is at ${top}px`);
  await context.close();
});

console.log('\nMessages (the stand-in business system is listening)');
await check('contact form: the message arrives in the system and the visitor gets a reference', async () => {
  const { page, context, problems } = await open(site.url, '/contact/');
  await page.waitForTimeout(600);
  await field(page, 'Your name').fill('Sita Sharma');
  await field(page, 'Phone').fill('9800000001');
  await field(page, 'Subject').fill('Do you deliver to Pokhara?');
  await field(page, 'Message').fill('Namaste, I would like six jars.');
  await page.getByRole('button', { name: 'Send message' }).click();
  await page.getByRole('heading', { name: 'Message sent' }).waitFor();
  const got = api.state.received.at(-1);
  expect(got.type === 'customer' && got.name === 'Sita Sharma' && got.phone === '9800000001', `system got ${JSON.stringify(got)}`);
  expect(got.subject === 'Do you deliver to Pokhara?' && got.message.includes('six jars') && got.page === '/contact/', 'subject, message or page missing');
  expect(got.website === '' && got.elapsedMs > 500, 'robot checks not sent');
  expect(!('email' in got), 'an empty email was sent');
  expect(await page.getByText('WEB-000001').isVisible(), 'reference not shown');
  expect(problems.length === 0, problems.join(' | '));
  await context.close();
  return 'reference WEB-000001 shown';
});

await check('"Ask about this product" carries the product into the message', async () => {
  const { page, context } = await open(site.url, '/products/mango-pickle/');
  await page.getByRole('link', { name: 'Ask about this product' }).click();
  await page.waitForURL('**/contact/?product=mango-pickle');
  await page.waitForFunction(() => document.querySelector('input[type=text][maxlength="160"]')?.value?.includes('Mango Pickle'));
  await field(page, 'Your name').fill('Hari');
  await field(page, 'Email').fill('hari@example.com');
  await field(page, 'Message').fill('What is the shelf life?');
  await page.getByRole('button', { name: 'Send message' }).click();
  await page.getByRole('heading', { name: 'Message sent' }).waitFor();
  const got = api.state.received.at(-1);
  expect(got.productSlug === 'mango-pickle' && got.subject === 'Question about Mango Pickle', `system got ${JSON.stringify(got)}`);
  await context.close();
});

await check('dealership form: missing answers are asked for; a complete application arrives', async () => {
  const { page, context } = await open(site.url, '/dealership/');
  const before = api.state.received.length;
  await field(page, 'Your name').fill('Ram Bahadur');
  await page.getByRole('button', { name: 'Send application' }).click();
  await page.waitForTimeout(300);
  expect(api.state.received.length === before, 'an incomplete application was sent');
  const errors = await page.locator('.field__error').allTextContents();
  expect(errors.length === 3 && errors.some((t) => t.includes('phone number')) && errors.some((t) => t.includes('town')), `errors shown: ${errors.join(' | ')}`);
  const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-field'));
  expect(focused === 'phone', `cursor went to ${focused}`);
  await field(page, 'Phone').fill('9811111111');
  await field(page, 'Business name').fill('Ram Kirana Pasal');
  await field(page, 'Type of business').selectOption('kirana');
  await field(page, 'Location').fill('Bharatpur, Chitwan');
  await page.getByRole('checkbox', { name: /Mango Pickle/ }).check();
  await page.getByRole('checkbox', { name: /Buckwheat Flour/ }).check();
  await page.getByRole('button', { name: 'Send application' }).click();
  await page.getByRole('heading', { name: 'Application sent' }).waitFor();
  const got = api.state.received.at(-1);
  expect(JSON.stringify(got.interestedIn) === '["mango-pickle","buckwheat-flour"]', `products: ${JSON.stringify(got.interestedIn)}`);
  expect(got.type === 'dealer' && got.businessType === 'kirana' && got.businessName === 'Ram Kirana Pasal' && got.location === 'Bharatpur, Chitwan', `system got ${JSON.stringify(got)}`);
  expect(await page.getByText('within 48 hours').first().isVisible(), '48-hour promise not shown');
  await context.close();
});

await check('support form: needs a phone or an email; then arrives with product, shop and pack details', async () => {
  const { page, context } = await open(site.url, '/support/');
  const before = api.state.received.length;
  await field(page, 'Your name').fill('Gita');
  await field(page, 'What happened?').fill('The lid was loose.');
  await page.getByRole('button', { name: 'Send request' }).click();
  await page.locator('.field__error').first().waitFor();
  expect((await page.locator('.field__error').first().textContent()).includes('phone number or an email'), 'wrong explanation');
  expect(api.state.received.length === before, 'sent without a way to answer');
  await field(page, 'Email').fill('gita@example.com');
  await field(page, 'Which product?').selectOption('chilli-pickle');
  await field(page, 'Where did you buy it?').fill('Bhatbhateni, Bharatpur');
  await field(page, 'Date or batch on the pack').fill('B-114');
  await page.getByRole('button', { name: 'Send request' }).click();
  await page.getByRole('heading', { name: 'Request sent' }).waitFor();
  const got = api.state.received.at(-1);
  expect(got.type === 'support' && got.productSlug === 'chilli-pickle' && got.boughtAt === 'Bhatbhateni, Bharatpur' && got.packDetails === 'B-114', `system got ${JSON.stringify(got)}`);
  await context.close();
});

await check('the system says no (too many messages): its words are shown and nothing typed is lost', async () => {
  api.state.mode = 'refuse';
  const { page, context } = await open(site.url, '/contact/');
  await field(page, 'Your name').fill('Sita');
  await field(page, 'Phone').fill('9800000001');
  await field(page, 'Message').fill('Second message');
  await page.getByRole('button', { name: 'Send message' }).click();
  await page.getByRole('alert').waitFor();
  expect((await page.getByRole('alert').textContent()).includes('Too many messages'), 'the reason is not shown');
  expect((await field(page, 'Message').inputValue()) === 'Second message', 'the message was cleared');
  api.state.mode = 'accept';
  await context.close();
});

for (const [name, breakIt] of [
  ['the system answers with an error', async () => (api.state.mode = 'broken')],
  ['the office computer is off', async () => new Promise((r) => api.server.close(r))],
]) {
  await check(`${name}: the visitor is told, and can send the same words by email or phone`, async () => {
    await breakIt();
    const { page, context } = await open(site.url, '/contact/');
    await field(page, 'Your name').fill('Sita Sharma');
    await field(page, 'Phone').fill('9800000001');
    await field(page, 'Message').fill('Please call me back.');
    await page.getByRole('button', { name: 'Send message' }).click();
    await page.getByRole('heading', { name: 'Not sent yet' }).waitFor({ timeout: 20000 });
    const mail = await page.getByRole('link', { name: 'Send by email' }).getAttribute('href');
    expect(mail.startsWith(`mailto:${content.contact.email}?`), 'email goes to the wrong address');
    const body = decodeURIComponent(mail.split('body=')[1]);
    expect(body.includes('Name: Sita Sharma') && body.includes('Phone: 9800000001') && body.includes('Please call me back.'), `email text is: ${body}`);
    const tel = await page.getByRole('link', { name: /Call/ }).getAttribute('href');
    expect(tel === `tel:${content.contact.phone.replace(/[^\d+]/g, '')}`, `phone link is ${tel}`);
    await page.getByRole('button', { name: /Back to the form/ }).click();
    expect((await field(page, 'Message').inputValue()) === 'Please call me back.', 'the message was lost');
    await context.close();
  });
}
site.server.close();

// ---------------------------------------------------------------- not linked yet (today's state)
console.log('\nBuilding the site as it is published today (business system not linked: forms are emailed)…');
build({ VITE_API_BASE: '' });
site = await serveDist();
console.log('\nEmailing forms to ' + content.forms.sendTo);

async function dealerFilled(relayAnswer) {
  const { page, context } = await open(site.url, '/dealership/');
  const seen = [];
  await page.route('https://formsubmit.co/**', async (route) => {
    seen.push({ url: route.request().url(), body: JSON.parse(route.request().postData() || '{}') });
    if (relayAnswer === 'offline') return route.abort();
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(relayAnswer) });
  });
  await field(page, 'Your name').fill('Ram Bahadur');
  await field(page, 'Phone').fill('9811111111');
  await field(page, 'Email').fill('ram@example.com');
  await field(page, 'Business name').fill('Ram Kirana Pasal');
  await field(page, 'Type of business').selectOption('kirana');
  await field(page, 'Location').fill('Hetauda, Makwanpur');
  await page.getByRole('checkbox', { name: /Chilli Pickle/ }).check();
  await page.waitForTimeout(1600);
  await page.getByRole('button', { name: 'Send application' }).click();
  return { page, context, seen };
}

await check(`dealership application is emailed to ${content.forms.sendTo}, readable, with a reply to the applicant`, async () => {
  const { page, context, seen } = await dealerFilled({ success: 'true', message: 'The form was submitted successfully.' });
  await page.getByRole('heading', { name: 'Application sent' }).waitFor();
  expect(seen.length === 1, `${seen.length} requests`);
  expect(seen[0].url === 'https://formsubmit.co/ajax/' + encodeURIComponent(content.forms.sendTo), `sent to ${seen[0].url}`);
  const b = seen[0].body;
  expect(b._subject === 'New dealership application: Ram Bahadur (Ram Kirana Pasal, Hetauda, Makwanpur)', `subject: ${b._subject}`);
  expect(b['Type of business'] === 'Kirana / General Store' && b['Would like to stock'] === 'Chilli Pickle' && b.Phone === '9811111111', JSON.stringify(b));
  expect(b._replyto === 'ram@example.com' && b._autoresponse.includes('within 48 hours'), 'no reply-to or confirmation for the applicant');
  expect(b['Sent from'] === content.site.url + '/dealership/', `page: ${b['Sent from']}`);
  await context.close();
  return 'subject: ' + b._subject;
});

for (const [name, answer] of [
  ['the email service is not activated yet', { success: 'false', message: 'This form needs Activation.' }],
  ['the email service cannot be reached', 'offline'],
]) {
  await check(`${name}: the applicant is told and keeps what they typed`, async () => {
    const { page, context } = await dealerFilled(answer);
    await page.getByRole('heading', { name: 'Not sent yet' }).waitFor({ timeout: 20000 });
    const body = decodeURIComponent((await page.getByRole('link', { name: 'Send by email' }).getAttribute('href')).split('body=')[1]);
    expect(body.includes('Type of business: Kirana / General Store') && body.includes('Would like to stock: Chilli Pickle'), `email text is: ${body}`);
    await page.getByRole('button', { name: /Back to the form/ }).click();
    expect((await field(page, 'Location').inputValue()) === 'Hetauda, Makwanpur', 'the answers were lost');
    await context.close();
  });
}

await check('a robot that fills the hidden box gets "sent" and nothing is emailed', async () => {
  const { page, context } = await open(site.url, '/contact/');
  let calls = 0;
  await page.route('https://formsubmit.co/**', (route) => { calls += 1; return route.abort(); });
  await page.evaluate(() => {
    const trap = document.querySelector('.trap input');
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    set.call(trap, 'http://spam.example'); trap.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await field(page, 'Your name').fill('Bot');
  await field(page, 'Phone').fill('1234567890');
  await field(page, 'Message').fill('Buy now');
  await page.waitForTimeout(1600);
  await page.getByRole('button', { name: 'Send message' }).click();
  await page.getByRole('heading', { name: 'Message sent' }).waitFor();
  expect(calls === 0, `${calls} emails sent`);
  await context.close();
});
site.server.close();
await browser.close();

fs.mkdirSync(path.join(root, 'tests/output'), { recursive: true });
fs.writeFileSync(path.join(root, 'tests/output/last-results.json'), JSON.stringify({ ranAt: new Date().toISOString(), results }, null, 2));
console.log(`\n${results.length - failed} of ${results.length} checks passed`);
process.exit(failed ? 1 : 0);
