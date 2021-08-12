import React from "react";

const Layout: React.FC = ({ children }) => {
  return (
    <div className="flex text-sm font-body leading-tight">
      <div className="flex-1 flex flex-col min-h-full items-center">
        <div className="relative min-h-full flex flex-col w-7xl px-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
