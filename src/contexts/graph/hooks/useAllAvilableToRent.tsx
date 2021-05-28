import request from "graphql-request";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CurrentAddressWrapper } from "../../CurrentAddressWrapper";
import { Lending, Nft } from "../classes";
import { queryAllLendingRenft } from "../queries";
import { LendingRaw } from "../types";
import { timeItAsync } from "../../../utils";
import createCancellablePromise from "../../create-cancellable-promise";
import usePoller from "../../../hooks/usePoller";
import UserContext from "../../UserProvider";

export const useAllAvailableToRent = (): {
  allAvailableToRent: Nft[];
  isLoading: boolean;
} => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const {signer} = useContext(UserContext);
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [isLoading, setLoading] = useState(false);

  const fetchRentings = useCallback(() => {
    if (!signer || !currentAddress) return;
    if (!process.env.REACT_APP_RENFT_API) {
      throw new Error("RENFT_API is not defined");
    }
    setLoading(true);

    const subgraphURI = process.env.REACT_APP_RENFT_API;
    const fetchRequest = createCancellablePromise<{ lendings: LendingRaw[] }>(
      timeItAsync(
        "Pulled All ReNFT Lendings",
        async () =>
          await request(subgraphURI, queryAllLendingRenft).catch(() => {
            console.warn("could not pull all ReNFT lendings");
            return {};
          })
      )
    );
    fetchRequest.promise
      .then((response) => {
        const address = currentAddress.toLowerCase();
        const lendingsReNFT = Object.values(response?.lendings || [])
          .filter((v) => v != null)
          // ! not equal. if lender address === address, then that means we have lent the item, and now want to rent our own item
          // ! therefore, this check is !==
          .filter((l) => {
            const userNotLender = l.lenderAddress.toLowerCase() !== address;
            const userNotRenter =
              (l.renting?.renterAddress ?? "o_0").toLowerCase() !== address;
            return userNotLender && userNotRenter;
          })
          .map((lending) => {
            return new Lending(lending, signer);
          });
        setNfts(lendingsReNFT);
      })
      .finally(() => {
        setLoading(false);
      });
    return fetchRequest.cancel;
  }, [currentAddress, signer]);

  useEffect(() => {
    fetchRentings();
  }, [fetchRentings]);

  usePoller(fetchRentings, 10000);

  return {
    allAvailableToRent: nfts,
    isLoading,
  };
};
