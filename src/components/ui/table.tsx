import React from "react";

const Table: React.FC = ({ children }) => {
  return (
    <div>
      <table>
        {children}
      </table>
    </div>
  );
};

export default Table;
