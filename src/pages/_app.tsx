import "../style/index.scss";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import Head from "next/head";
import React, { useEffect, useMemo } from "react";
import { StateProvider } from "../contexts/StateProvider";
import AppLayout from "../components/app-layout";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@material-ui/core/styles";
import { theme } from "../components/theme";
import ReactGA from "react-ga";
import { useRouter } from "next/router";
import "../scripts/wdyr";

//@ts-ignore
import NProgress from "nprogress";

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

const MyApp: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  const origin = useMemo(() => {
    return "http://dapp.renft.io";
  }, []);

  useEffect(() => {
    const handleStart = (url: string) => {
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

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }
  }, []);

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
          content={`${origin}/favicon.png`}
        />
        <meta
          property="og:image"
          content={`${origin}/favicon.png`}
          key="og:image"
        />
      </Head>

      <StateProvider>
        <ThemeProvider theme={theme}>
          <AppLayout>
            <Component {...pageProps} />
          </AppLayout>
        </ThemeProvider>
      </StateProvider>
    </>
  );
};

export default MyApp;
