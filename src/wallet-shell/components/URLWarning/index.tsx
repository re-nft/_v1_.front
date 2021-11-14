import React, { ReactNode, useContext } from "react";
import { AlertTriangle, X } from "react-feather";
import { isMobile } from "react-device-detect";
import { Web3StatusActions, Web3StatusState } from "../../index.provider";
import { APP_URL } from "../../constants";
import clsx from "clsx";

const PhisAlert2 = ({
  children,
  isActive,
}: {
  children: ReactNode;
  isActive: boolean;
}) => {
  return (
    <div
      className={clsx(
        isActive && "flex",
        !isActive && "none",
        "w-full p-1 bg-blue-600 text-white text-xs justify-between items-center"
      )}
    >
      {children}
    </div>
  );
};

// TODO fix this
export function URLWarning() {
  const {
    application: { URLWarningVisible },
  } = useContext(Web3StatusState);
  const { toggleURLWarning } = useContext(Web3StatusActions);
  if (!process.env.browser) {
    return null;
  }
  const hostnameMatch = window.location.hostname === APP_URL;

  if (hostnameMatch && !isMobile) {
    return null;
  }
  return (
    <PhisAlert2 isActive={URLWarningVisible}>
      <div className="flex px-2">
        <AlertTriangle className="mr-1" size={12} /> Always make sure the URL is
        <code
          style={{ padding: "0 4px", display: "inline", fontWeight: "bold" }}
        >
          {APP_URL}
        </code>{" "}
        - bookmark it to be safe.
      </div>
      <button className="cursor-pointer" onClick={toggleURLWarning}>
        <X size={12} />
      </button>
    </PhisAlert2>
  );
}
