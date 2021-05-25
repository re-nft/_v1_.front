import React from "react";
import { CurrentAddressContextWrapperProvider } from "./CurrentAddressContextWrapper";
import { NFTMetaProvider } from "./NftMetaState";
import { UserLendingProvider } from "./UserLending";
import { UserRentingProvider } from "./UserRenting";

export const StateProvider: React.FC = ({ children }) => {
  return (
    <CurrentAddressContextWrapperProvider>
      <NFTMetaProvider>
        <UserLendingProvider>
          <UserRentingProvider>{children}</UserRentingProvider>
        </UserLendingProvider>
      </NFTMetaProvider>
    </CurrentAddressContextWrapperProvider>
  );
};
