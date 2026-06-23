import "@/styles/globals.css";
import Head from "next/head";
import type { AppProps } from "next/app";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { KeyboardControls } from "@react-three/drei";
import { ToastContainer } from "react-toastify";
import { useMemo } from "react";

const APP_NAME = "Land of Landless";
const APP_DESCRIPTION = "Land of Landless";

// query client
const queryClient = new QueryClient();

type KeyboardControlsEntry<T extends string = string> = {
  /** Name of the action */
  name: T;
  /** The keys that define it, you can use either event.key, or event.code */
  keys: string[];
  /** If the event receives the keyup event, true by default */
  up?: boolean;
};

export default function App({ Component, pageProps }: AppProps) {
  enum Controls {
    forward = "forward",
    backward = "backward",
    leftward = "leftward",
    rightward = "rightward",
    jump = "jump",
    run = "run",
  }

  const map = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
      { name: Controls.backward, keys: ["ArrowDown", "KeyS"] },
      { name: Controls.leftward, keys: ["ArrowLeft", "KeyA"] },
      { name: Controls.rightward, keys: ["ArrowRight", "KeyD"] },
      { name: Controls.jump, keys: ["Space"] },
      { name: Controls.run, keys: ["ShiftLeft", "ShiftRight"] },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      <Head>
        <title>{`${APP_NAME} | Land of Landless`}</title>
        <meta
          name="description"
          content="Land of landless is a sci-fi game where you can build your own empire and conquer the galaxy"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icons/favicon.ico" />
        <meta name="application-name" content={APP_NAME} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
        <meta name="description" content={APP_DESCRIPTION} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#FFFFFF" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={APP_NAME} />
        <meta property="og:title" content={APP_NAME} />
        <meta property="og:description" content={APP_DESCRIPTION} />
        <meta property="og:url" content="https://landoflandless.com" />
        <meta
          property="og:image"
          content="https://landoflandless.com/icons/og-image.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@LandOfLandless" />
        <meta name="twitter:title" content={APP_NAME} />
        <meta name="twitter:description" content={APP_DESCRIPTION} />
        <meta
          name="twitter:image"
          content="https://landoflandless.com/icons/og-image.png"
        />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-touch-icon.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <KeyboardControls map={map}>
          <ToastContainer />
          <Component {...pageProps} />
        </KeyboardControls>
      </QueryClientProvider>
    </>
  );
}
