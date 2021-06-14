import { RENFT_ADDRESS } from "@renft/sdk";
import React, { useContext, useEffect, useState } from "react";
import {
  ProviderContext,
  ReNFTContext,
  Symfoni,
} from "../hardhat/SymfoniContext";
import { CurrentAddressProvider } from "./CurrentAddressWrapper";
import { GraphProvider } from "./graph";
import { AvailableForRentProvider } from "./AvailableForRent";
import { NFTMetaProvider } from "./NftMetaState";
import { TransactionStateProvider } from "./TransactionState";
import { UserLendingProvider } from "./UserLending";
import { UserRentingProvider } from "./UserRenting";
import { TimestampProvider } from "./TimestampProvider";
import { NetworkName } from "../types";

export const StateProvider: React.FC = ({ children }) => {
  return (
    <Symfoni autoInit={false}>
      <CurrentAddressProvider>
        <GraphProvider>
          <TransactionStateProvider>
            <NFTMetaProvider>
              <UserLendingProvider>
                <UserRentingProvider>
                  <AvailableForRentProvider>
                    <TimestampProvider>{children}</TimestampProvider>
                  </AvailableForRentProvider>
                </UserRentingProvider>
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
  const [provider] = useContext(ProviderContext);
  const [address, setAddress] = useState("");

  useEffect(() => {
    const getNetwork = async () => {
      const network = await provider?.getNetwork();
      const name = network?.name;
      const newAddress =
        name === NetworkName.mainnet ? RENFT_ADDRESS : instance?.address || "";
      if (newAddress) setAddress(newAddress);
    };
    getNetwork();
  }, [instance, provider, address]);
  return address;
};
