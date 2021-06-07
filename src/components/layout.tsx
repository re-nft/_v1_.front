import React from "react";
import Helmet from "react-helmet";


const Layout: React.FC = ({ children }) => {
  return (
    <div className="app">
      <Helmet title="ReNFT" />
      <div className="app__container">
        <div className="main">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
