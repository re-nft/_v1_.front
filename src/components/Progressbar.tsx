import React from "react";

// TODO: a prop that takes the % completion (in bps). e.g. 10000 means 100%, 5050 means 50.50%
const Progressbar: React.FC = () => {
  return (
    <>
      <div className="wrapper">
        <div className="progressbar">
          <div className="stylization"></div>
        </div>
      </div>
    </>
  );
};

export default Progressbar;
