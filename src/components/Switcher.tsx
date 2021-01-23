import React, { useCallback, useState } from "react";
import classNames from "classnames";

const Switcher: React.FC = () => {
  const [active, setActive] = useState(false);
  const handleClick = useCallback(() => {
    setActive((active) => !active);
  }, []);
  const classes = classNames({
    m_button: true,
    active: active,
  });

  return (
    <div className={classes} onClick={handleClick}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

export default Switcher;
