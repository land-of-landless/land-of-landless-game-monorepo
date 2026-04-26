import "@/styles/globals.css";
import Head from "next/head";
import type { AppProps } from "next/app";
import { ScreenSizeProvider } from "@/contexts/ScreenSizeContext";
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
    back = "back",
    left = "left",
    right = "right",
    space = "space",
    shift = "shift",
  }

  const map = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
      { name: Controls.back, keys: ["ArrowDown", "KeyS"] },
      { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
      { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
      { name: Controls.space, keys: ["Space"] },
      { name: Controls.shift, keys: ["ShiftLeft", "ShiftRight"] },
    ],
    [],
  );

  return (
    <>
      <Head>
        <meta name="application-name" content={APP_NAME} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
        <meta name="description" content={APP_DESCRIPTION} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
