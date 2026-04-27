import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  Serwist,
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
  ExpirationPlugin,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    // Change this attribute's name to your `injectionPoint`.
    // `injectionPoint` is an InjectManifest option.
    // See https://serwist.pages.dev/docs/build/configuring
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// const BUILD_VERSION = process.env.BUILD_VERSION || "dev";
const BUILD_VERSION = "1.0.0";
const CACHE_NAME_BASE = "game-assets";
const CACHE_NAME = `${CACHE_NAME_BASE}-${BUILD_VERSION}`;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  // runtimeCaching: defaultCache,
  runtimeCaching: [
    // 1. Game assets (models, textures) - Cache First for performance
    {
      matcher: ({ url, sameOrigin }) =>
        sameOrigin && /\.(gltf|glb|hdr|bin|jpg|png)$/i.test(url.pathname),
      handler: new CacheFirst({
        cacheName: "game-assets",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },
    {
      matcher: ({ url }) =>
        url.hostname === "cdn.thelol.xyz" &&
        /\.(glb|gltf|hdr|bin|jpg|png)$/i.test(url.pathname),
      handler: new CacheFirst({
        cacheName: "cdn-game-assets",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // 2. API calls - Network First with fallback
    // {
    //   matcher: ({ url }) => url.pathname.startsWith("/api/"),
    //   handler: new NetworkFirst({
    //     cacheName: "api-cache",
    //     networkTimeoutSeconds: 3,
    //     plugins: [
    //       new ExpirationPlugin({
    //         maxEntries: 25,
    //         maxAgeSeconds: 60 * 60, // 1 hour
    //       }),
    //     ],
    //   }),
    // },
    // 3. UI resources - Stale While Revalidate for constantly up-to-date content
    {
      matcher: ({ request }) =>
        request.destination === "style" || request.destination === "script",
      handler: new StaleWhileRevalidate({
        cacheName: "static-resources",
      }),
    },
    // 4. Default for other same-origin requests
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

// Activate event: delete old versioned caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName.startsWith(CACHE_NAME_BASE) &&
            cacheName !== CACHE_NAME
          ) {
            console.log(`[SW] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        }),
      ),
    ),
  );
});

// Optional message listener for manual cleanup
self.addEventListener("message", (event) => {
  if (event.data?.type === "CLEAR_OLD_CACHES") {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        if (cacheName.startsWith(CACHE_NAME_BASE) && cacheName !== CACHE_NAME) {
          caches.delete(cacheName);
        }
      });
    });
  }
});

serwist.addEventListeners();
