import React from 'react';

export default ({hidden}) => (
  !hidden && <div className="coming-soon" title="Coming Soon">
    Coming Soon
  </div>
);