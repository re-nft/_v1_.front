import React from "react";
import Layout from "./layout";
import { MintNfts } from "../dev/mint-nfts";
import { MintTokens } from "../dev/mint-token";
import { Header } from "./header";
import { Footer } from "./footer";
import { Menu } from "./menu";

const App: React.FC = ({ children }) => {
  const showMint = process.env.NEXT_PUBLIC_SHOW_MINT === "true";
  return (
    <Layout>
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
      <div className="content-wrapper main-content mb-l">{children}</div>
      {/* FOOTER */}
      <Footer />
    </Layout>
  );
};

export default App;