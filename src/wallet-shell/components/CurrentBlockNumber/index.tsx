import React, { useState, useEffect } from "react";
import { ExternalLink } from "../common/ExternalLink";

import { useBlockNumber, useActiveWeb3React } from "../../state-hooks";
import { getEtherscanLink } from "../../utils";

export const StyledPolling: React.FC = ({ children }) => {
  return (
    <div className="fixed bottom-0 right-0 hidden p-4 transition-opacity duration-300 ease-linear color-green-500 hover:opacity-100 md:flex">
      {children}
    </div>
  );
};

export const StyledPollingDot: React.FC = ({ children }) => {
  return (
    <div className="relative w-2 h-2 bg-green-500 rounded">{children}</div>
  );
};

export const Spinner: React.FC = () => {
  return (
    <div
      className="relative mt-1 ml-2 bg-green-500 border border-t-2 border-solid rounded w-3.5 h-3.5"
      style={{
        minWidth: "8px",
        minHeight: "8px",
        animation: "loading 1s cubic-bezier(0.83, 0, 0.17, 1) infinite",
        transform: "translateZ(0)",
        left: "-3px",
        top: "-3px",
      }}
    />
  );
};

export const CurrentBlockNumber: React.FC = () => {
  const { chainId } = useActiveWeb3React();

  const blockNumber = useBlockNumber();

  const [isMounted, setIsMounted] = useState(true);

  useEffect(
    () => {
      const timer1 = setTimeout(() => setIsMounted(true), 1000);

      // this will clear Timeout when component unmount like in willComponentUnmount
      return () => {
        setIsMounted(false);
        clearTimeout(timer1);
      };
    },
    [blockNumber] //useEffect will run only one time
    //if you pass a value to array, like this [data] than clearTimeout will run every time this value changes (useEffect re-run)
  );

  return (
    <ExternalLink
      href={
        chainId && blockNumber
          ? getEtherscanLink(chainId, blockNumber.toString(), "block")
          : ""
      }
    >
      <StyledPolling>
        <div className="flex flex-row items-center justify-center">
          <p
            className="mr-2 text-sm font-medium text-green-500"
            style={{ opacity: isMounted ? "0.3" : "0.6" }}
          >
            {blockNumber}
          </p>
          <StyledPollingDot>{!isMounted && <Spinner />}</StyledPollingDot>
        </div>
      </StyledPolling>
    </ExternalLink>
  );
};

export default CurrentBlockNumber;
