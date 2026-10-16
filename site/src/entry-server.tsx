import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { App } from './App';
import { allRoutes } from './content';
import { headTags, seoFor } from './seo';

/** Used when the site is built: one finished HTML page per address. */
export function render(url: string): { html: string; head: string } {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
  return { html, head: headTags(seoFor(url)) };
}

export const routes = allRoutes;
