import * as React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import { DMSans } from "@/fonts";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" className={DMSans.className}>
        <Head>
          <meta name="heleket" content="cd723b03" />
          <meta name="theme-color" content="#ff9f29" />
          <link rel="shortcut icon" href="/favicon.ico" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
