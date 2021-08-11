import React from "react";
import Layout from "./layout";

import { Header } from "./header";
import { Footer } from "./footer";
import { Menu } from "./menu";
import { SearchMenu } from "./search-menu";
import { DevMenu } from "./dev-menu";

const App: React.FC = ({ children }) => {
  return (
    <Layout>
      <div className="content-wrapper mb-l">
        <Header />
      </div>
      <div className="content-wrapper mb-l">
        <Menu />
        <SearchMenu/>
      </div>
      <DevMenu/>
      {/* CONTENT */}
      <div className="content-wrapper main-content mb-l">{children}</div>
      {/* FOOTER */}
      <Footer />
    </Layout>
  );
};

export default App;
