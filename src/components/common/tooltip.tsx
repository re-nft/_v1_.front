import React from "react";

export const Tooltip: React.FC<{
  title: string;
}> = ({ children }) => {
  return <div>{children}</div>;
};
