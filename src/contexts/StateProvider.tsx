import { RENFT_ADDRESS } from "@renft/sdk";
import React, { useContext } from "react";
import { IS_PROD } from "../consts";
import { ReNFTContext, Symfoni } from "../hardhat/SymfoniContext";
import { CurrentAddressProvider } from "./CurrentAddressWrapper";
import { GraphProvider } from "./graph";
import { NFTMetaProvider } from "./NftMetaState";
import { TransactionStateProvider } from "./TransactionState";
import { UserLendingProvider } from "./UserLending";
import { UserRentingProvider } from "./UserRenting";

export const StateProvider: React.FC = ({ children }) => {
  return (
    <Symfoni>
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
    </Symfoni>
  );
};

export const useContractAddress = (): string => {
  const { instance } = useContext(ReNFTContext);
  return IS_PROD ? RENFT_ADDRESS : instance ? instance.address : "";
};
