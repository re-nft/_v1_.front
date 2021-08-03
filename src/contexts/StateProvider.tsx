import React from "react";
import { CurrentAddressProvider } from "./CurrentAddressWrapper";
import { GraphProvider } from "./graph";
import { AvailableForRentProvider } from "./AvailableForRent";
import { TransactionStateProvider } from "./TransactionState";
import { UserLendingProvider } from "./UserLending";
import { UserRentingProvider } from "./UserRenting";
import { TimestampProvider } from "./TimestampProvider";
import { SnackAlertProvider } from "./SnackProvider";
import { UserProvider } from "./UserProvider";
import { ContractsProvider } from "./ContractsProvider";

export const StateProvider: React.FC = ({ children }) => {
  return (
    <SnackAlertProvider>
      <UserProvider>
        <CurrentAddressProvider>
          <ContractsProvider>
            <GraphProvider>
              <TransactionStateProvider>
                  <UserLendingProvider>
                    <UserRentingProvider>
                      <AvailableForRentProvider>
                        <TimestampProvider>{children}</TimestampProvider>
                      </AvailableForRentProvider>
                    </UserRentingProvider>
                  </UserLendingProvider>
              </TransactionStateProvider>
            </GraphProvider>
          </ContractsProvider>
        </CurrentAddressProvider>
      </UserProvider>
    </SnackAlertProvider>
  );
};
