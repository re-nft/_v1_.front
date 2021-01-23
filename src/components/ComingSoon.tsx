import React from "react";

type ComingSoonProps = {
  hidden: boolean;
};

const ComingSoon: React.FC<ComingSoonProps> = ({ hidden }) => (
  <>
    {!hidden && (
      <div className="coming-soon" title="Coming Soon">
        Coming Soon
      </div>
    )}
  </>
);

export default ComingSoon;
