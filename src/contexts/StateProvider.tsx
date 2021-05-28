import React from "react";
import { CurrentAddressProvider } from "./CurrentAddressWrapper";
import { GraphProvider } from "./graph";
import { NFTMetaProvider } from "./NftMetaState";
import { TransactionStateProvider } from "./TransactionState";
import { UserLendingProvider } from "./UserLending";
import { UserRentingProvider } from "./UserRenting";

export const StateProvider: React.FC = ({ children }) => {
  return (
    <CurrentAddressProvider>
      <GraphProvider>
        <TransactionStateProvider>
          <NFTMetaProvider>
            <UserLendingProvider>
              <UserRentingProvider>{children}</UserRentingProvider>
            </UserLendingProvider>
          </NFTMetaProvider>
        </TransactionStateProvider>
      </GraphProvider>
    </CurrentAddressProvider>
  );
};
