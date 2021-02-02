import React, { useContext } from "react";
import Helmet from "react-helmet";
import { Box } from "@material-ui/core";

import "../style/index.scss";
import {
  SymfoniContext,
  CurrentAddressContext,
} from "../../src/hardhat/SymfoniContext";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { init } = useContext(SymfoniContext);
  const [currentAddress] = useContext(CurrentAddressContext);

  return (
    <div style={{ marginBottom: "100px" }}>
      <Helmet title="Rent NFT" />
      <div className="Container">
        <div className="Header">
          <div className="Wrap">
            <div className="Header__body">
              <h1 className="Header__title">
                <div data-text="Rent NFT">Rent NFT</div>
              </h1>
              <div className="Header__summary">{currentAddress}</div>
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
