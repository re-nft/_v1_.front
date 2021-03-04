import React from "react";

const Table: React.FC = ({ children }) => {
  return (
    <div>
      <table>
        {children}
        {/* <thead>
          <tr>
            <th>Column 1</th>
            <th>Column 2</th>
            <th>Column 3</th>
            <th>Column 4</th>
            <th>Column 5</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
            <td>Cell 3</td>
            <td>Cell 4</td>
            <td>Cell 5</td>
          </tr>
        </tbody> */}
      </table>
    </div>
  );
};

export default Table;
