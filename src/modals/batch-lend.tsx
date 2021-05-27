import React, { useState, useCallback, useContext, useEffect } from "react";

import { RENFT_SUBGRAPH_ID_SEPARATOR } from "../consts";
import { ProviderContext } from "../hardhat/SymfoniContext";
import { PaymentToken, TransactionHash } from "../types";
import CssTextField from "../components/css-text-field";
import Modal from "./modal";
import CommonInfo from "./common-info";
import MinimalSelect from "../components/select";
import { ReNFTContext } from "../hardhat/SymfoniContext";
import { TransactionStateContext } from "../contexts/TransactionState";
import { Nft } from "../contexts/graph/classes";
import isApprovalForAll from "../services/is-approval-for-all";
import setApprovalForAll from "../services/set-approval-for-all";
import ActionButton from "../components/action-button";
import { getUniqueID } from "../controller/batch-controller";
import { CurrentAddressContextWrapper } from "../contexts/CurrentAddressContextWrapper";
import createCancellablePromise from "../contexts/create-cancellable-promise";
import { useStartLend } from "../hooks/useStartLend";
import { BigNumber } from "@ethersproject/bignumber";

type LendOneInputs = {
  [key: string]: {
    lendAmount: number;
    maxDuration: number;
    borrowPrice: number;
    nftPrice: number;
  };
};

type LendModalProps = {
  nfts: Nft[];
  open: boolean;
  onClose(): void;
};

export const BatchLendModal: React.FC<LendModalProps> = ({
  nfts,
  open,
  onClose,
}) => {
  const { instance: renft } = useContext(ReNFTContext);
  const { isActive, setHash, hash } = useContext(TransactionStateContext);
  const [currentAddress] = useContext(CurrentAddressContextWrapper);
  const [pmtToken, setPmtToken] = useState<Record<string, PaymentToken>>({});
  const [provider] = useContext(ProviderContext);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [nft] = nfts;
  const [lendOneInputs, setLendOneInputs] = useState<LendOneInputs>({});
  const startLend = useStartLend();

  const handleLend = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!startLend) return;
      if(!isApproved) return;
      if(isActive) return;

      const lendAmountsValues: number[] = [];
      const maxDurationsValues: number[] = [];
      const borrowPriceValues: number[] = [];
      const nftPriceValues: number[] = [];
      const addresses: string[] = [];
      const tokenIds: BigNumber[] = [];
      const pmtTokens = Object.values(pmtToken);

      Object.values(lendOneInputs).forEach((item) => {
        lendAmountsValues.push(item.lendAmount);
        maxDurationsValues.push(item.maxDuration);
        borrowPriceValues.push(item.borrowPrice);
        nftPriceValues.push(item.nftPrice);
      });
      nfts.forEach(({ address, tokenId }) => {
        addresses.push(address);
        tokenIds.push(BigNumber.from(tokenId));
      });

      const transaction = createCancellablePromise(
        startLend(
          addresses,
          tokenIds,
          lendAmountsValues,
          maxDurationsValues,
          borrowPriceValues,
          nftPriceValues,
          pmtTokens
        )
      );
      transaction.promise.then((tx) => {
        onClose();
        if (tx) setHash(tx.hash);
      });

      return transaction.cancel;
    },

    [startLend, isApproved, isActive, pmtToken, lendOneInputs, nfts, onClose, setHash]
  );

  useEffect(() => {
    if (!provider) return;
    if (!hash) return;
    const fetchRequest = createCancellablePromise(
      provider.getTransactionReceipt(hash)
    );

    fetchRequest.promise
      .then((receipt) => {
        const status = receipt?.status ?? 0;
        if (status === 1) setIsApproved(true);
      })
      .catch(() => {
        console.warn("issue pulling txn receipt in batch lend");
        return undefined;
      });
    return fetchRequest.cancel;
  }, [hash, provider]);

  const handleApproveAll = useCallback(() => {
    if (!provider) return;
    if (!renft) return;
    const transaction = createCancellablePromise(
      setApprovalForAll(nfts)
    );
    transaction.promise
      .then(([tx]) => {
        if (!tx) return;
        setHash(tx.hash);
      })
      .catch(() => {
        console.warn("issue approving all in batch lend");
        return [undefined];
      });

    return () => {
      transaction.cancel();
    };
  }, [nfts, provider, renft, setHash]);

  const handleStateChange = useCallback(
    (target: string, value: string) => {
      const [id, name] = target.split(RENFT_SUBGRAPH_ID_SEPARATOR);
      // todo: this is poor naming of the variable
      setLendOneInputs({
        ...lendOneInputs,
        [id]: {
          ...lendOneInputs[id],
          [name]: value,
        },
      });
    },
    [lendOneInputs, setLendOneInputs]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleStateChange(e.target.name, e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    handleStateChange(e.target.name, e.target.value);
  };

  const onSelectPaymentToken = useCallback(
    (value: number, tokenId) => {
      setPmtToken({
        ...pmtToken,
        [tokenId]: value,
      });
    },
    [pmtToken, setPmtToken]
  );

  useEffect(() => {
    if (!renft || !currentAddress) return;
    const transaction = createCancellablePromise(
      isApprovalForAll(nfts, currentAddress)
    );
    transaction.promise
      .then((isApproved) => {
        setIsApproved(isApproved);
      })
      .catch(() => {
        console.warn("batch lend issue with is approval for all");
      });
    return transaction.cancel;
  }, [nfts, currentAddress, setIsApproved, renft]);

  return (
    <Modal open={open} handleClose={onClose}>
      <form noValidate autoComplete="off" onSubmit={handleLend}>
        {nfts.map((nft: Nft) => {
          return (
            <div
              className="modal-dialog-section"
              key={getUniqueID(nft.address, nft.tokenId)}
            >
              <CommonInfo nft={nft}>
                {/* lendAmount for 721 is ignored */}
                <CssTextField
                  required
                  label="Amount"
                  // todo: this is not a unique name and will cause collisions
                  id={`${nft.tokenId}${RENFT_SUBGRAPH_ID_SEPARATOR}lendAmount`}
                  variant="outlined"
                  value={lendOneInputs[nft.tokenId]?.lendAmount ?? ""}
                  type="number"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name={`${nft.tokenId}${RENFT_SUBGRAPH_ID_SEPARATOR}lendAmount`}
                />
                <CssTextField
                  required
                  label="Max lend duration"
                  id={`${nft.tokenId}${RENFT_SUBGRAPH_ID_SEPARATOR}maxDuration`}
                  variant="outlined"
                  value={lendOneInputs[nft.tokenId]?.maxDuration ?? ""}
                  type="number"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name={`${nft.tokenId}${RENFT_SUBGRAPH_ID_SEPARATOR}maxDuration`}
                />
                <CssTextField
                  required
                  label="Borrow Price"
                  id={`${nft.tokenId}${RENFT_SUBGRAPH_ID_SEPARATOR}borrowPrice`}
                  variant="outlined"
                  value={lendOneInputs[nft.tokenId]?.borrowPrice ?? ""}
                  type="number"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name={`${nft.tokenId}${RENFT_SUBGRAPH_ID_SEPARATOR}borrowPrice`}
                />
                <CssTextField
                  required
                  label="Collateral"
                  id={`${nft.tokenId}${RENFT_SUBGRAPH_ID_SEPARATOR}nftPrice`}
                  variant="outlined"
                  value={lendOneInputs[nft.tokenId]?.nftPrice ?? ""}
                  type="number"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name={`${nft.tokenId}${RENFT_SUBGRAPH_ID_SEPARATOR}nftPrice`}
                />
                <MinimalSelect
                  onSelect={(v) => onSelectPaymentToken(v, nft.tokenId)}
                  selectedValue={pmtToken[nft.tokenId] ?? -1}
                />
              </CommonInfo>
            </div>
          );
        })}
        <div className="modal-dialog-button">
          {!isApproved && (
            <ActionButton<Nft>
              title="Approve all"
              nft={nft}
              onClick={handleApproveAll}
            />
          )}
          {isApproved && (
            <div className="nft__control">
              <button type="submit" className="nft__button">
                {nfts.length > 1 ? "Lend all" : "Lend"}
              </button>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default BatchLendModal;
