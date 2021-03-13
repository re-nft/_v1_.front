import React, { useContext } from "react";
import Helmet from "react-helmet";

import "../../style/index.scss";
import { CurrentAddressContext } from "../../hardhat/SymfoniContext";
import { short } from "../../utils";

const Layout: React.FC = ({ children }) => {
  const [currentAddress] = useContext(CurrentAddressContext);

  return (
    <div className="app">
      <Helmet title="ReNFT">
        {/* <meta property="og:image" content={shareImg} /> */}
      </Helmet>
      <div className="app__container">
        <div className="main">
          {/* HEADER */}
          <div className="content-wrapper mb-l">
            <div className="header">
              <div className="header__logo"></div>
              <div className="header__user">
                {short(currentAddress)}
              </div>
            </div>
          </div>
          {/* CONTENT */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
