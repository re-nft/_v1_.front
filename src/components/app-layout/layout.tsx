import React from "react";

const getTheme = () => {
  const comp = process.env.NEXT_PUBLIC_FILTER_COMPANY;
  if (comp === "animetas") return "theme-animetas";
  if (comp === "gfc") return "theme-gfc";
  return "";
};

const Layout: React.FC = ({ children }) => {
  return (
    <div className={`app ${getTheme()}`}>
      <div className="app__container">
        <div className="main">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
