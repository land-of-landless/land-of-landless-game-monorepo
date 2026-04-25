import "@/styles/globals.css";
import { ScreenSizeProvider } from "@/contexts/ScreenSizeContext";
import type { AppProps } from "next/app";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

// query client
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ScreenSizeProvider>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </ScreenSizeProvider>
  );
}
