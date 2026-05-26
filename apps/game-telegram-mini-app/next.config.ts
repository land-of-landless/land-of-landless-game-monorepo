import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Telegram Mini Apps require the app to be served without trailing slashes
  // and with consistent asset prefixing.
  trailingSlash: false,

  // Some packages from the Telegram SDK ship as ESM-only modules.
  // Transpile them so Next.js can bundle them correctly.
  transpilePackages: [
    '@telegram-apps/telegram-ui',
    '@tma.js/sdk-react',
    '@tma.js/sdk',
  ],
};

export default nextConfig;
