import { useCallback, useContext, useEffect, useState } from "react";

import { BigNumber } from "ethers";
import { Nft } from "../../contexts/graph/classes";
import { CurrentAddressWrapper } from "../../contexts/CurrentAddressWrapper";
import createCancellablePromise from "../../contexts/create-cancellable-promise";
import usePoller from "../usePoller";
import UserContext from "../../contexts/UserProvider";
import { ContractContext } from "../../contexts/ContractsProvider";
import { usePrevious } from "../usePrevious";
import { hasDifference } from "../../utils";

const BigNumZero = BigNumber.from("0");

function range(start: number, stop: number, step: number) {
  const a = [start];
  let b = start;
  while (b < stop) {
    a.push((b += step || 1));
  }
  return a;
}
//TODO:eniko refactor to rxjs
export const useFetchNftDev = (): { devNfts: Nft[]; isLoading: boolean } => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const { network } = useContext(UserContext);
  const { E721, E721B, E1155, E1155B } = useContext(ContractContext);

  const { signer } = useContext(UserContext);
  const [devNfts, setDevNfts] = useState<Nft[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const previousAddress = usePrevious(currentAddress);

  const fetchAsync = useCallback(async () => {
    if (network !== process.env.NEXT_PUBLIC_NETWORK_SUPPORTED) {
      if (isLoading) setIsLoading(false);
      if (devNfts && devNfts.length > 0) setDevNfts([]);
    }
    if (typeof process.env.NEXT_PUBLIC_FETCH_NFTS_DEV === "undefined") {
      if (isLoading) setIsLoading(false);
      return;
    }
    if (!E1155 || !E721 || !E721B || !E1155B || !signer || !currentAddress) {
      setIsLoading(false);
      return [];
    }
    const usersNfts: Nft[] = [];
    const E1155IDs = range(0, 1005, 1);
    const e721 = E721.connect(signer);
    const e721b = E721B.connect(signer);
    const e1155 = E1155.connect(signer);
    const e1155b = E1155B.connect(signer);
    const num721s = await e721
      .balanceOf(currentAddress)
      .catch(() => BigNumZero);

    const num721bs = await e721b
      .balanceOf(currentAddress)
      .catch(() => BigNumZero);

    const num1155s = await e1155

      .balanceOfBatch(Array(E1155IDs.length).fill(currentAddress), E1155IDs)
      .catch(() => []);

    const num1155bs = await e1155b

      .balanceOfBatch(Array(E1155IDs.length).fill(currentAddress), E1155IDs)
      .catch(() => []);

    for (let i = 0; i < num721s.toNumber(); i++) {
      try {
        const tokenId = await e721.tokenOfOwnerByIndex(
          currentAddress,
          String(i)
        );
        usersNfts.push(new Nft(e721.address, tokenId.toString(), "1", true));
      } catch (e) {
        console.debug(
          "most likely tokenOfOwnerByIndex does not work. whatever, this is not important"
        );
      }
    }

    for (let i = 0; i < num721bs.toNumber(); i++) {
      try {
        const tokenId = await e721b.tokenOfOwnerByIndex(
          currentAddress,
          String(i)
        );
        usersNfts.push(new Nft(e721b.address, tokenId.toString(), "1", true));
      } catch (e) {
        console.debug(
          "most likely tokenOfOwnerByIndex does not work. whatever, this is not important"
        );
      }
    }

    let amountBalance = await e1155.balanceOfBatch(
      Array(E1155IDs.length).fill(currentAddress),
      E1155IDs
    );

    for (let i = 0; i < num1155s.length; i++) {
      if (amountBalance[i].toNumber() > 0) {
        usersNfts.push(
          new Nft(
            e1155.address,
            E1155IDs[i].toString(),
            amountBalance[i].toString(),
            false
          )
        );
      }
    }

    amountBalance = await e1155b.balanceOfBatch(
      Array(E1155IDs.length).fill(currentAddress),
      E1155IDs
    );

    for (let i = 0; i < num1155bs.length; i++) {
      if (amountBalance[i].toNumber() > 0) {
        usersNfts.push(
          new Nft(
            e1155b.address,
            E1155IDs[i].toString(),
            amountBalance[i].toString(),
            false
          )
        );
      }
    }

    const normalizedLendings = devNfts;
    const normalizedLendingNew = usersNfts;

    const hasDiff = hasDifference(normalizedLendings, normalizedLendingNew);
    if (currentAddress !== previousAddress) {
      setDevNfts(usersNfts);
    } else if (hasDiff) {
      setDevNfts(usersNfts);
    }
    setIsLoading(false);
  }, [
    E1155,
    E721,
    E721B,
    E1155B,
    signer,
    currentAddress,
    isLoading,
    devNfts,
    previousAddress,
    network,
  ]);

  useEffect(() => {
    const fetchRequest = createCancellablePromise(fetchAsync());
    return fetchRequest.cancel;
  }, [fetchAsync]);

  usePoller(() => {
    const fetchRequest = createCancellablePromise(fetchAsync());
    return fetchRequest.cancel;
  }, 3000);

  return { devNfts, isLoading };
};
