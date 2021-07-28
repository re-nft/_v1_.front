import "../style/index.scss";
import "video-react/dist/video-react.css";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import Head from "next/head";
import React from "react";
import { StateProvider } from "../contexts/StateProvider";
import AppLayout from "../components/app-layout";
import Helmet from "react-helmet";
import type { AppProps } from "next/app";

const MyApp: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>ReNFT</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Helmet title="ReNFT" />
      </Head>
      <StateProvider>
        <AppLayout>
          <Component {...pageProps} />
        </AppLayout>
      </StateProvider>
    </>
  );
}

export default MyApp;