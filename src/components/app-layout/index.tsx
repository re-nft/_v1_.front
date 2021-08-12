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
      <div className="flex w-full mb-8">
        <Header />
      </div>
      <div className="flex w-full mb-8">
        <Menu />
        <SearchMenu />
      </div>
      <DevMenu />
      {/* CONTENT */}
      <div
        className="flex w-full min-w-full mb-8 border-4 border-black"
        style={{
          boxShadow: "5px 5px 0 black",
          backgroundImage:
            "linear-gradient(rgb(244, 62, 119) 0%, rgb(104, 87, 159) 100%)",
        }}
      >
        {children}
      </div>
      {/* FOOTER */}
      <Footer />
    </Layout>
  );
};

export default App;
