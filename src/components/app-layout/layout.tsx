import React from "react";

const Layout: React.FC = ({ children }) => {
  return (
    <div className="app">
      <div className="app__container">
        <div className="main">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
