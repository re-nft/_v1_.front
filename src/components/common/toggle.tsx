import React from "react";

export const Toggle: React.FC<{
  title: string;
  onSwitch?: () => void;
  toggleValue?: boolean;
}> = ({ title, onSwitch, toggleValue }) => {
  return (
    <div className="content__row content__navigation">
      <div className="switch">
        <div className="switch__title">{title}</div>
        <div className="switch__control" onClick={onSwitch}>
          <div className={`toggle ${toggleValue ? "toggle__active" : ""}`}>
            <div className="toggle__pin"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
