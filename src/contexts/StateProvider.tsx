import React from "react";
import { CurrentAddressProvider } from "./CurrentAddressWrapper";
import { GraphProvider } from "./graph";
import { TransactionStateProvider } from "./TransactionState";
import { TimestampProvider } from "./TimestampProvider";
import { UserProvider } from "./UserProvider";
import { ContractsProvider } from "./ContractsProvider";

export const StateProvider: React.FC = ({ children }) => {
  return (
    <UserProvider>
      <CurrentAddressProvider>
        <ContractsProvider>
          <GraphProvider>
            <TransactionStateProvider>
              <TimestampProvider>{children}</TimestampProvider>
            </TransactionStateProvider>
          </GraphProvider>
        </ContractsProvider>
      </CurrentAddressProvider>
    </UserProvider>
  );
};
