/**
 * pages/_document.tsx
 *
 * Custom Document — sets the HTML lang, viewport meta, and theme colour.
 * In Pages Router this is the server-rendered HTML shell.
 */

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Prevents a flash of light background in Telegram */}
        <meta name="theme-color" content="#0a0c10" />
        {/* Telegram Web App SDK — loaded from CDN so it's available before React hydrates */}
        <script src="https://telegram.org/js/telegram-web-app.js" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
