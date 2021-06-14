import request from "graphql-request";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CurrentAddressWrapper } from "./CurrentAddressWrapper";
import { Lending, Nft } from "./graph/classes";
import { queryAllLendingRenft } from "./graph/queries";
import { LendingRaw } from "./graph/types";
import { timeItAsync } from "../utils";
import createCancellablePromise from "./create-cancellable-promise";
import { SignerContext } from "../hardhat/SymfoniContext";
import { diffJson } from "diff";
import usePoller from "../hooks/usePoller";


export const AvailableForRentContext = createContext<{
  isLoading: boolean;
  allAvailableToRent: Nft[];
}>({ isLoading: true, allAvailableToRent: [] });

export const AvailableForRentProvider: React.FC = ({ children }) => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const [signer] = useContext(SignerContext);

  const [nfts, setNfts] = useState<Nft[]>([]);
  const [isLoading, setLoading] = useState(true);

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
          .filter((v) => !v.renting)
          .filter((v) => v != null)
          // doesn't have renting
          .filter((v) => !v.renting)
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
        // TODO only update if changed

        const normalizedLendings = nfts.map((l) => l.toJSON());
        const normalizedLendingNew = lendingsReNFT.map((l) => l.toJSON());

        const difference = diffJson(normalizedLendings, normalizedLendingNew, {
          ignoreWhitespace: true,
        });
        //const difference = true;
        if (
          difference &&
          difference[1] &&
          (difference[1].added || difference[1].removed)
        ) {
          setNfts(lendingsReNFT);
        }

      })
      .finally(() => {
        setLoading(false);
      });
    return fetchRequest.cancel;
  }, [currentAddress, nfts, signer]);

  useEffect(() => {
    fetchRentings();
  }, [fetchRentings]);

  usePoller(fetchRentings, 10000);

  return (
    <AvailableForRentContext.Provider
      value={{
        allAvailableToRent: nfts,
        isLoading,
      }}
    >
      {children}
    </AvailableForRentContext.Provider>
  );
};
