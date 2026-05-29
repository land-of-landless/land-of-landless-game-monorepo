import * as React from "react";
import Head from "next/head";
import Script from "next/script";
import type { AppProps } from "next/app";
import { DMSans } from "@/fonts";
import { GoogleAnalytics } from "@next/third-parties/google";

import "../styles/globals.css";
import "../styles/reactPlayer.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <div>
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
      <div className={DMSans.className}>
        <GoogleAnalytics gaId="G-FH915G6JJ9" />
        <Component {...pageProps} />
      </div>
    </>
  );
}
