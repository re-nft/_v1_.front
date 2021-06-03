import React from "react";

type PageLayoutProps = {
  onSwitch?: () => void;
  title?: string;
  toggleValue?: boolean;
};

const PageLayout: React.FC<PageLayoutProps> = ({
  onSwitch,
  toggleValue,
  title,
  children,
}) => {
  return (
    <div className="content">
      {title && (
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
      )}
      {!title && <div style={{ height: "4em" }} />}
      {children}
    </div>
  );
};

export default PageLayout;
