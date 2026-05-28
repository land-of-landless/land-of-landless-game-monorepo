import * as React from "react";
import Head from "next/head";
import Script from "next/script";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider, EmotionCache } from "@emotion/react";
import theme from "../utils/theme";
import createEmotionCache from "../utils/createEmotionCache";
// import { Analytics } from "@vercel/analytics/react";
import { Box as MuiBox } from "@mui/material";
import { DMSans } from "@/fonts";
// import GoogleAnalytics from "@/components/GoogleAnalytics";
import { GoogleAnalytics } from "@next/third-parties/google";

import "../styles/globals.css";
import "../styles/reactPlayer.css";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  return (
    <>
      <div>
        {/* <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FH915G6JJ9"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-FH915G6JJ9');
        `}
        </Script> */}
        <Script
          id="clarity_analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "gwtazdrs64");`,
          }}
        />
      </div>

      <CacheProvider value={emotionCache}>
        <Head>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
          <meta
            name="description"
            content="lol | Land of Landless is way more than a dope fun game! Invade and Rule, Have fun and Earn!"
            key="desc"
          />
          <meta property="og:title" content="lol | Land of Landless" />
          <meta
            property="og:description"
            content="lol | Land of Landless is way more than a dope fun game! Invade and Rule, Have fun and Earn!"
          />
          <meta
            property="og:image"
            content="https://cdn.thelol.xyz/logos/lol-logo-round.png"
          />
        </Head>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <MuiBox className={DMSans.className}>
            {/* <GoogleAnalytics GA_MEASUREMENT_ID="G-FH915G6JJ9" /> */}
            <GoogleAnalytics gaId="G-FH915G6JJ9" />
            <Component {...pageProps} />
            {/* <Analytics /> */}
          </MuiBox>
        </ThemeProvider>
      </CacheProvider>
    </>
  );
}
