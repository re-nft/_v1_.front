import React from "react";
import { CurrentAddressContextWrapperProvider } from "./CurrentAddressContextWrapper";
import { GraphProvider } from "./graph";
import { NFTMetaProvider } from "./NftMetaState";
import { TransactionStateProvider } from "./TransactionState";
import { UserLendingProvider } from "./UserLending";
import { UserRentingProvider } from "./UserRenting";

export const StateProvider: React.FC = ({ children }) => {
  return (
    <CurrentAddressContextWrapperProvider>
      <GraphProvider>
        <TransactionStateProvider>
          <NFTMetaProvider>
            <UserLendingProvider>
              <UserRentingProvider>{children}</UserRentingProvider>
            </UserLendingProvider>
          </NFTMetaProvider>
        </TransactionStateProvider>
      </GraphProvider>
    </CurrentAddressContextWrapperProvider>
  );
};
