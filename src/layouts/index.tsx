import React, { useContext } from "react";
import Helmet from "react-helmet";
import { Box } from "@material-ui/core";

import "../style/index.scss";
import { CurrentAddressContext } from "../../src/hardhat/SymfoniContext";
import { short } from "../utils";
import TxnState from "../components/TxnState";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [currentAddress] = useContext(CurrentAddressContext);

  return (
    <div style={{ marginBottom: "100px" }}>
      <Helmet title="Rent NFT" />
      <TxnState txnHash="" />
      <div className="Container">
        <div className="Header">
          <div className="Wrap">
            <div className="Header__body">
              <h1 className="Header__title">
                <div data-text="ReNFT">ReNFT</div>
              </h1>
              <div className="Header__summary">{short(currentAddress)}</div>
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
