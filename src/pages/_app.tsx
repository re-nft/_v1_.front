import "../styles/globals.css";
import "../styles/loader.css";
import "../styles/nprogress.css";
import "../styles/video-react.css";
import "../wallet-shell/styles/global.css";
import "@reach/dialog/styles.css";

import Head from "next/head";
import React, { useEffect } from "react";
import type { AppProps } from "next/app";

import ReactGA from "react-ga";
import { useRouter } from "next/router";
import "../scripts/wdyr";
//@ts-ignore
import NProgress from "nprogress";
import { NetworkName } from "renft-front/types";

import { enableMapSet } from "immer";
import { AppLayout } from "renft-front/components/layouts/app-layout";

enableMapSet();

if (typeof window !== "undefined") {
  ReactGA.initialize(process.env.NEXT_PUBLIC_GA_ID || "", {
    debug: false,
    // typeof window !== "undefined"
    //   ? window.location.hostname !== "dapp.renft.io"
    //   : true,
    gaOptions: {
      siteSpeedSampleRate: 100,
    },
    testMode: window.location.hostname !== "dapp.renft.io",
  });
}

const origin =
  process.env.NEXT_PUBLIC_NETWORK_SUPPORTED === NetworkName.mainnet
    ? "https://dapp.renft.io"
    : "https://staging.dapp.renft.io";

//throw it here instead in connector
const NETWORK_URL = process.env.NEXT_PUBLIC_PROVIDER_URL;
if (process.env && !NETWORK_URL) {
  throw new Error(
    `NEXT_PUBLIC_PROVIDER_URL must be a defined environment variable`
  );
}

const MyApp: React.FC<AppProps & { err: unknown }> = ({
  Component,
  pageProps,
  err,
}: AppProps & { err: unknown }) => {
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => {
      NProgress.start();
    };
    const handleStop = () => {
      NProgress.done();
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
    };
  }, [router]);

  useEffect(() => {
    ReactGA.pageview(router.asPath);
  }, [router.asPath]);

  // //TODO:eniko what is this
  // useEffect(() => {
  //   // Remove the server-side injected CSS.
  //   const jssStyles = document.querySelector("#jss-server-side");
  //   if (jssStyles) {
  //     jssStyles.parentElement?.removeChild(jssStyles);
  //   }
  // }, []);

  return (
    <>
      <Head>
        <title>ReNFT</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:url" content={origin} key="og:url" />
        <meta property="twitter:url" key="twitter:url" content={origin} />
        <meta
          property="twitter:image"
          key="twitter:image"
          content={`${origin}/assets/seo.jpg`}
        />
        <meta
          property="og:image"
          content={`${origin}/assets/seo.jpg`}
          key="og:image"
        />
      </Head>
      <AppLayout>
        <Component {...pageProps} err={err} />
      </AppLayout>
    </>
  );
};

export default MyApp;
