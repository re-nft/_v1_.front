import React, { useCallback, useContext } from "react";
import Helmet from "react-helmet";
import Link from "gatsby-link";

// contexts
import DappContext from "../contexts/Dapp";

import "../style/index.scss";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { wallet } = useContext(DappContext);
  const userAddress = useCallback(() => {
    if (wallet == null || !wallet.account) {
      return "";
    }
    return `${wallet.account.substr(0, 5)}...${wallet.account.substr(
      wallet.account.length - 5,
      5
    )}`;
  }, [wallet]);

  return (
    <div>
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
              <div className="Header__summary">
                {userAddress() !== "" ? userAddress() : "Connect to Görli"}
              </div>
            </div>
          </div>
        </div>
        <div className="Wrap">{children}</div>
        <div className="Footer" style={{ textAlign: "center" }}>
          ♦ See me in openverse soon... ♦
        </div>
      </div>
    </div>
  );
};

export default Layout;
