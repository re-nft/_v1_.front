import React from "react";
import { SnackAlert } from "./common/snack-alert";
import { Toggle } from "./common/toggle";

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
        <Toggle title={title} toggleValue={toggleValue} onSwitch={onSwitch} />
      )}
      {!title && <div style={{ height: "4em" }} />}
      {children}
      <SnackAlert></SnackAlert>
    </div>
  );
};

export default PageLayout;
