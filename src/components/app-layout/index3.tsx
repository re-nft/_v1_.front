import React from "react";

import { Header } from "./connect";
import { Footer } from "./footer";
import { Menu } from "./menu";
import { SearchMenu } from "./search-menu";
import { DevMenu } from "./dev-menu";

const App: React.FC = ({ children }) => {
  return (
    <div className="flex text-sm font-body leading-tight">
      <div className="flex-1 flex flex-col min-h-full items-center">
        <div className="relative min-h-full flex flex-col w-7xl px-8">
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
        </div>
      </div>
    </div>
  );
};

export default App;
