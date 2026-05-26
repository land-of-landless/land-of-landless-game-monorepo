/**
 * pages/_app.tsx
 *
 * The root of the Pages Router app.
 * Mounts the TelegramProvider (SDK + AppRoot) and AppLayout around every page,
 * and imports global styles.
 */

import type { AppProps } from 'next/app';
import Head from 'next/head';

import { TelegramProvider } from '@/components/TelegramProvider';
import { AppLayout } from '@/components/AppLayout';

import '@telegram-apps/telegram-ui/dist/styles.css';
import 'normalize.css/normalize.css';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="description" content="Land of Landless — Manage your game profile" />
        <title>Land of Landless</title>
      </Head>

      <TelegramProvider
        loadingFallback={
          <div
            style={{
              minHeight: '100dvh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0a0c10',
            }}
          >
            <span style={{ color: '#8892b0', fontSize: '0.875rem' }}>
              Loading…
            </span>
          </div>
        }
      >
        <AppLayout>
          <Component {...pageProps} />
        </AppLayout>
      </TelegramProvider>
    </>
  );
}
