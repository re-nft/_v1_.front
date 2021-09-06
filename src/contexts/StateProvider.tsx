import React from "react";
import { CurrentAddressProvider } from "./CurrentAddressWrapper";
import { TransactionStateProvider } from "./TransactionState";
import { TimestampProvider } from "./TimestampProvider";

export const StateProvider: React.FC = ({ children }) => {
  return (
    <CurrentAddressProvider>
      <TransactionStateProvider>
        <TimestampProvider>{children}</TimestampProvider>
      </TransactionStateProvider>
    </CurrentAddressProvider>
  );
};
