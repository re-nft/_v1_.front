import React, { useState, useCallback, useContext, useEffect } from "react";

import { RENFT_SUBGRAPH_ID_SEPARATOR } from "../consts";
import { ProviderContext } from "../hardhat/SymfoniContext";
import { PaymentToken } from "../types";
import CssTextField from "../components/css-text-field";
import Modal from "./modal";
import CommonInfo from "./common-info";
import MinimalSelect from "../components/select";
import { ReNFTContext } from "../hardhat/SymfoniContext";
import { TransactionStateContext } from "../contexts/TransactionState";
import { Nft } from "../contexts/graph/classes";
import startLend from "../services/start-lend";
import isApprovalForAll from "../services/is-approval-for-all";
import setApprovalForAll from "../services/set-approval-for-all";
import ActionButton from "../components/action-button";
import { getUniqueID } from "../controller/batch-controller";
import { CurrentAddressContextWrapper } from "../contexts/CurrentAddressContextWrapper";

type LendOneInputs = {
  [key: string]: {
    [key: string]: string;
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
  const { isActive, setHash } = useContext(TransactionStateContext);
  const [currentAddress] = useContext(CurrentAddressContextWrapper);
  const [pmtToken, setPmtToken] = useState<Record<string, PaymentToken>>({});
  const [provider] = useContext(ProviderContext);
  const [isApproved, setIsApproved] = useState<boolean>();
  const [nft] = nfts;
  const [lendOneInputs, setLendOneInputs] = useState<LendOneInputs>({});

  const handleLend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!renft || isActive) return;

      const lendAmountsValues: string[] = [];
      const maxDurationsValues: string[] = [];
      const borrowPriceValues: string[] = [];
      const nftPriceValues: string[] = [];

      const lendOneInputsValues = Object.values(lendOneInputs);

      for (let i = 0; i < lendOneInputsValues.length; i++) {
        const item = lendOneInputsValues[i];
        lendAmountsValues.push(item["lendAmount"]);
        maxDurationsValues.push(item["maxDuration"]);
        borrowPriceValues.push(item["borrowPrice"]);
        nftPriceValues.push(item["nftPrice"]);
      }

      const pmtTokens = Object.values(pmtToken);
      const tx = await startLend(
        renft,
        nfts,
        lendAmountsValues,
        maxDurationsValues,
        borrowPriceValues,
        nftPriceValues,
        pmtTokens
      );

      if (tx) setHash(tx.hash);
      onClose();
    },

    [renft, isActive, lendOneInputs, pmtToken, nfts, setHash, onClose]
  );

  const handleApproveAll = useCallback(async () => {
    if (!currentAddress || !renft || isActive || !provider) return;

    const [tx] = await setApprovalForAll(renft, nfts).catch(() => {
      console.warn("issue approving all in batch lend");
      return [undefined];
    });

    if (!tx) return;

    setHash(tx.hash);
    const receipt = await provider.getTransactionReceipt(tx.hash).catch(() => {
      console.warn("issue pulling txn receipt in batch lend");
      return undefined;
    });

    const status = receipt?.status ?? 0;
    if (status === 1) setIsApproved(true);
  }, [currentAddress, renft, isActive, setHash, provider, setIsApproved, nfts]);

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
    isApprovalForAll(renft, nfts, currentAddress)
      .then((isApproved) => {
        setIsApproved(isApproved);
      })
      .catch(() => {
        console.warn("batch lend issue with is approval for all");
      });
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
