import React from "react";

type ColdProps = {
  fancyText: string;
};

const Cold: React.FC<ColdProps> = ({ fancyText }) => {
  return (
    <div>
      <div id="fire" style={{ width: "400px", height: "300px" }}></div>
      <div>{fancyText}</div>
    </div>
  );
};

export default Cold;
