import React from "react";
import {
  BrowserRouter as Router
} from "react-router-dom";
import Layout from "../layout";
import { MintNfts } from "../dev/mint-nfts";
import { MintTokens } from "../dev/mint-token";
import { Header } from "./header";
import { Footer } from "./footer";
import { Menu } from "./menu";
import { Routes } from "./routes";

const App: React.FC = () => {
  const showMint = process.env.REACT_APP_SHOW_MINT === "true";
  return (
    <Layout>
      <Router>
        <div className="content-wrapper mb-l">
          <Header />
        </div>
        <div className="content-wrapper mb-l">
          <Menu />
          {showMint && (
            <>
              <MintNfts />
              <div>
                <MintTokens />
              </div>
            </>
          )}
        </div>
        {/* CONTENT */}
        <div className="content-wrapper main-content mb-l">
          <Routes />
        </div>
      </Router>
      {/* FOOTER */}
      <Footer />
    </Layout>
  );
};

export default App;
