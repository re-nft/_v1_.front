import { useCallback, useContext, useEffect, useState } from "react";

import { BigNumber } from "ethers";
import { Nft } from "../../graph/classes";
import { CurrentAddressWrapper } from "../../CurrentAddressWrapper";
import createCancellablePromise from "../../create-cancellable-promise";
import usePoller from "../../../hooks/usePoller";
import UserContext from "../../UserProvider";
import { ContractContext } from "../../ContractsProvider";
import { diffJson } from "diff";
import { usePrevious } from "../../../hooks/usePrevious";

const BigNumZero = BigNumber.from("0");

function range(start: number, stop: number, step: number) {
  const a = [start];
  let b = start;
  while (b < stop) {
    a.push((b += step || 1));
  }
  return a;
}

export const useFetchNftDev = (): { devNfts: Nft[]; isLoading: boolean } => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const { network } = useContext(UserContext);
  const { E721, E721B, E1155, E1155B } = useContext(ContractContext);

  const { signer } = useContext(UserContext);
  const [devNfts, setDevNfts] = useState<Nft[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const previousAddress = usePrevious(currentAddress);

  const fetchAsync = useCallback(async () => {
    if (network === "homestead") {
      if (isLoading) setIsLoading(false);
      return;
    };
    if (typeof process.env.REACT_APP_FETCH_NFTS_DEV === "undefined") {
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
        usersNfts.push(new Nft(e721.address, tokenId, "1", true, signer));
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
        usersNfts.push(new Nft(e721b.address, tokenId, "1", true, signer));
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
            amountBalance[i],
            false,
            signer
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
            amountBalance[i],
            false,
            signer
          )
        );
      }
    }

    const normalizedLendings = devNfts.map((nft) => nft.toJSON());
    const normalizedLendingNew = usersNfts.map((nft) =>
    nft.toJSON()
    );

    const difference = diffJson(
      normalizedLendings,
      normalizedLendingNew,
      { ignoreWhitespace: true }
    );
    if (currentAddress !== previousAddress) {
      setDevNfts(usersNfts);
    }
    else if (
      difference &&
      difference[1] &&
      (difference[1].added || difference[1].removed)
    ) {
      setDevNfts(usersNfts);
    }
    setIsLoading(false);
  }, [E1155, E721, E721B, E1155B, signer, currentAddress, isLoading, devNfts, previousAddress]);

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
