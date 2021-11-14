import clsx from "clsx";
import React, { useContext } from "react";
import { Popup } from "../../types";
import { Web3StatusState } from "../../index.provider";
import { PopupItem } from "./PopupItem";

export const MobilePopupWrapper: React.FC<{
  fitContent?: boolean;
}> = ({ children, fitContent }) => {
  return (
    <div
      className={clsx(
        fitContent && "mx-0 my-auto mb-5",
        "relative block max-w-full sm:hidden"
      )}
      style={{ height: fitContent ? "fit-content" : 0 }}
    >
      {children}
    </div>
  );
};

export const MobilePopupInner: React.FC = ({ children }) => {
  return (
    <div
      className="flex overflow-x-auto overflow-y-hidden flew-row"
      style={{ height: "99%" }}
    >
      {children}
    </div>
  );
};

export const FixedPopupColumn: React.FC = ({ children }) => {
  return (
    <div className="fixed z-30 hidden w-full max-w-xs gap-5 top-16 right-4 sm:grid grid-rows-auto">
      {children}
    </div>
  );
};
export const Popups: React.FC = () => {
  const {
    application: { popupList },
  } = useContext(Web3StatusState);
  const activePopups = popupList.filter((t) => t.show);

  return (
    <>
      <FixedPopupColumn>
        {activePopups.map((item: Popup) => (
          <PopupItem
            key={item.key}
            content={item.content}
            popKey={item.key}
            removeAfterMs={item.removeAfterMs}
          />
        ))}
      </FixedPopupColumn>
      <MobilePopupWrapper fitContent={activePopups?.length > 0}>
        <MobilePopupInner>
          {activePopups // reverse so new items up front
            .slice(0)
            .reverse()
            .map((item: Popup) => (
              <PopupItem
                key={item.key}
                content={item.content}
                popKey={item.key}
                removeAfterMs={item.removeAfterMs}
              />
            ))}
        </MobilePopupInner>
      </MobilePopupWrapper>
    </>
  );
};

export default Popups;
