import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render(): React.ReactElement {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta name="theme-color" content="black" />
          <meta name="description" content="reNFT - P2P NFT rentals" />
          <meta
            name="ui-version"
            content={`${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}`}
          />
          <link
            rel="apple-touch-icon"
            sizes="57x57"
            href="/apple-icon-57x57.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="60x60"
            href="/apple-icon-60x60.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="72x72"
            href="/apple-icon-72x72.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="76x76"
            href="/apple-icon-76x76.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="114x114"
            href="/apple-icon-114x114.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="120x120"
            href="/apple-icon-120x120.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="144x144"
            href="/apple-icon-144x144.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="152x152"
            href="/apple-icon-152x152.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-icon-180x180.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="192x192"
            href="/android-icon-192x192.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="96x96"
            href="/favicon-96x96.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <meta name="msapplication-TileColor" content="#000000" />
          <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
          <link rel="manifest" href="/manifest.json" />
          <noscript>You need to enable JavaScript to run this app.</noscript>
          <meta property="og:type" content="website" key="og:type" />

          <meta property="og:title" content="reNFT" key="og:title" />
          <meta
            property="og:description"
            content="reNFT - Peer to Peer NFT Rentals"
            key="og:description"
          />

          <meta
            property="twitter:card"
            key="twitter:card"
            content="summary_large_image"
          />
          <meta property="twitter:title" key="twitter:title" content="reNFT" />
          <meta
            property="twitter:description"
            key="twitter:description"
            content="reNFT - Peer to Peer NFT Rentals"
          />
        </Head>

        <body className="relative">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
