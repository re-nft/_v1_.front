import "../style/index.scss";
import "video-react/dist/video-react.css";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import Head from "next/head";
import React, { useEffect } from "react";
import { StateProvider } from "../contexts/StateProvider";
import AppLayout from "../components/app-layout";
import Helmet from "react-helmet";
import type { AppProps } from "next/app";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { theme } from "../components/theme";



const MyApp: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => {

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }
  }, []);

  return (
    <>
      <Head>
        <title>ReNFT</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Helmet title="ReNFT" />
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
