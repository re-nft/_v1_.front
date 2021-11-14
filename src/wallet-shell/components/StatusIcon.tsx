import { Identicon } from "./Identicon";
import { injected, walletconnect, walletlink } from "../connectors";
import { AbstractConnector } from "@web3-react/abstract-connector";
import React from "react";
import clsx from "clsx";
import { CoinbaseIcon } from "./common/icons/coinbase";
import { WalletConnectIcon } from "./common/icons/walletconect";

export const MainWalletAction: React.FC<{ onClick: () => void }> = ({
  children,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="p-2 ml-2 text-sm font-normal text-pink-500 border border-pink-200 border-solid hover:cursor-pointer focus:shadow-md focus:border-pink-300 hover:border-pink-300 active:shadow-md active:border-pink-300"
      style={{ width: "fit-content" }}
    >
      {children}
    </button>
  );
};

export const IconWrapper: React.FC<{ end?: boolean }> = ({ children, end }) => {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center w-4 h-4",
        end && "items-end mr-2"
      )}
    >
      {children}
    </div>
  );
};
export const StatusIcon: React.FC<{
  end?: boolean;
  connector?: AbstractConnector;
}> = ({ connector, end }) => {
  if (connector === injected) {
    return <Identicon />;
  } else if (connector === walletconnect) {
    return (
      <IconWrapper end={end}>
        <WalletConnectIcon width="16px" height="16px" />
      </IconWrapper>
    );
  } else if (connector === walletlink) {
    return (
      <IconWrapper end={end}>
        <CoinbaseIcon width="16px" height="16px" />
      </IconWrapper>
    );
  }
  return null;
};
