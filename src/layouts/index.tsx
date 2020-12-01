import React, { useMemo, useContext } from "react";
import Helmet from "react-helmet";
import { Box } from "@material-ui/core";
import Link from "gatsby-link";

import DappContext from "../contexts/Dapp";
import { short } from "../utils";

import "../style/index.scss";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { wallet, connectWallet } = useContext(DappContext);
  const userAddress = useMemo(() => {
    if (!wallet?.account) return "Connect to Görli";
    return short(wallet.account);
  }, [wallet]);

  return (
    <div style={{ marginBottom: "100px" }}>
      <Helmet title="Rent NFT" />
      <div className="Container">
        <div className="Header">
          <div className="Wrap">
            <div className="Header__body">
              <h1 className="Header__title">
                <Link data-text="Rent NFT" to="/">
                  Rent NFT
                </Link>
              </h1>
              <div className="Header__summary" onClick={connectWallet}>
                {userAddress}
              </div>
            </div>
          </div>
        </div>
        <div className="Wrap">
          <Box style={{ minWidth: "1000px" }}>{children}</Box>
        </div>
      </div>
    </div>
  );
};

export default Layout;
