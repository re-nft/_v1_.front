import { RENFT_ADDRESS } from "@renft/sdk";
import React, { useContext, useEffect, useState } from "react";
import { CurrentAddressProvider } from "./CurrentAddressWrapper";
import { GraphProvider } from "./graph";
import { AvailableForRentProvider } from "./AvailableForRent";
import { NFTMetaProvider } from "./NftMetaState";
import { TransactionStateProvider } from "./TransactionState";
import { UserLendingProvider } from "./UserLending";
import { UserRentingProvider } from "./UserRenting";
import { TimestampProvider } from "./TimestampProvider";
import { NetworkName } from "../types";
import { SnackAlertProvider } from "./SnackProvider";
import UserContext, { UserProvider } from "./UserProvider";
import { ContractContext, ContractsProvider } from "./ContractsProvider";

export const StateProvider: React.FC = ({ children }) => {
  return (
    <SnackAlertProvider>
    <UserProvider>
      <CurrentAddressProvider>
        <ContractsProvider>
          <GraphProvider>
            <TransactionStateProvider>
              <NFTMetaProvider>
                <UserLendingProvider>
                  <UserRentingProvider>
                    <AvailableForRentProvider>
                      <TimestampProvider>
                        {children}
                      </TimestampProvider>
                    </AvailableForRentProvider>
                  </UserRentingProvider>
                </UserLendingProvider>
              </NFTMetaProvider>
            </TransactionStateProvider>
          </GraphProvider>
        </ContractsProvider>
      </CurrentAddressProvider>
    </UserProvider>
    </SnackAlertProvider>
  );
};

export const useContractAddress = (): string => {
  const { ReNFT } = useContext(ContractContext);
  const { network } = useContext(UserContext);
  const [address, setAddress] = useState("");

  useEffect(() => {
    const getNetwork = async () => {
      const newAddress =
      network === NetworkName.mainnet ? RENFT_ADDRESS : ReNFT?.address || "";
      if (newAddress) setAddress(newAddress);
    };
    getNetwork();
  }, [address, ReNFT?.address, network]);
  return address;
};
