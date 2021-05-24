import request from "graphql-request";
import { useContext, useEffect, useMemo, useState } from "react";
import { SignerContext } from "../../../hardhat/SymfoniContext";
import { CurrentAddressContextWrapper } from "../../CurrentAddressContextWrapper";
import { Lending, Nft } from "../classes";
import { queryAllLendingRenft } from "../queries";
import { LendingRaw } from "../types";
import { timeItAsync } from "../../../utils";
import createCancellablePromise from "../../create-cancellable-promise";

export const useAllAvailableToRent = (): {
  allAvailableToRent: Nft[];
  isLoading: boolean;
} => {
  const [currentAddress] = useContext(CurrentAddressContextWrapper);
  const [signer] = useContext(SignerContext);
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAndCreate = async () => {
      if (!process.env.REACT_APP_RENFT_API) {
        throw new Error("RENFT_API is not defined");
      }
      if (!signer) return;
      if (!currentAddress) return;
      setLoading(true);
      const subgraphURI = process.env.REACT_APP_RENFT_API;
      const response: { data: { lendings: LendingRaw[] } } = await timeItAsync(
        "Pulled All ReNFT Lendings",
        async () =>
          await request(subgraphURI, queryAllLendingRenft).catch((e) => {
            return {};
          })
      );

      const address = currentAddress.toLowerCase();
      const lendingsReNFT = Object.values(response?.data?.lendings || [])
        .filter((v) => v != null)
        .filter((l) => l.lenderAddress.toLowerCase() === address)
        .map((lending) => {
          return new Lending(lending, signer);
        });

      setLoading(false);
      setNfts(lendingsReNFT);
    };
    const fetchRequest = createCancellablePromise(fetchAndCreate());
    return fetchRequest.cancel;
  }, [signer, currentAddress]);

  return {
    allAvailableToRent: nfts,
    isLoading,
  };
};
