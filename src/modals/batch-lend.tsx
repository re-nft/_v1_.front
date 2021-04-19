import React, { useState, useCallback, useContext, useEffect } from "react";
import { ProviderContext } from "../hardhat/SymfoniContext";
import { PaymentToken } from "../types";
import CssTextField from "../components/css-text-field";
import Modal from "./modal";
import MinimalSelect from "../components/select";
import {
  CurrentAddressContext,
  RentNftContext,
} from "../hardhat/SymfoniContext";
import { TransactionStateContext } from "../contexts/TransactionState";
import { Nft } from "../contexts/graph/classes";
import startLend from "../services/start-lend";
import isApprovalForAll from "../services/is-approval-for-all";
import setApprovalForAll from "../services/set-approval-for-all";
import ActionButton from "../components/action-button";

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
  const { instance: renft } = useContext(RentNftContext);
  const { isActive, setHash } = useContext(TransactionStateContext);
  const [currentAddress] = useContext(CurrentAddressContext);
  const [pmtToken, setPmtToken] = useState<Record<string, PaymentToken>>({});
  const [provider] = useContext(ProviderContext);
  const [isApproved, setIsApproved] = useState<boolean>();
  const [nft] = nfts;
  const [lendOneInputs, setLendOneInputs] = useState<LendOneInputs>({});

  const handleLend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!renft || isActive) return;

      const lendOneInputsValues = Object.values(lendOneInputs);
      const maxDurationsValues = lendOneInputsValues.map(
        (item) => item["maxDuration"]
      );
      const borrowPriceValues = lendOneInputsValues.map(
        (item) => item["borrowPrice"]
      );
      const nftPriceValues = lendOneInputsValues.map(
        (item) => item["nftPrice"]
      );
      const pmtTokens = Object.values(pmtToken);
      const tx = await startLend(
        renft,
        nfts,
        maxDurationsValues,
        borrowPriceValues,
        nftPriceValues,
        pmtTokens
      );

      setHash(tx.hash);
      onClose();
    },
    [renft, setHash, onClose, isActive, lendOneInputs, pmtToken, nfts]
  );

  const handleApproveAll = useCallback(async () => {
    if (!currentAddress || !renft || isActive || !provider) return;
    const [tx] = await setApprovalForAll(renft, nfts);
    setHash(tx.hash);
    const receipt = await provider.getTransactionReceipt(tx.hash);
    const status = receipt.status ?? 0;
    if (status === 1) {
      setIsApproved(true);
    }
  }, [currentAddress, renft, isActive, setHash, provider, setIsApproved, nfts]);

  const handleStateChange = useCallback(
    (target: string, value: string) => {
      const [id, name] = target.split("::");
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
      .catch((e) => {
        console.warn(e);
      });
  }, [nfts, currentAddress, setIsApproved, renft]);

  return (
    <Modal open={open} handleClose={onClose}>
      <form noValidate autoComplete="off" onSubmit={handleLend}>
        {nfts.map((nftItem: Nft) => {
          return (
            <div
              className="modal-dialog-section"
              key={`${nftItem.address}::${nftItem.tokenId}`}
            >
              <div className="modal-dialog-for">
                <div className="label">Token Id</div>
                <div className="dot"></div>
                <div className="label">{nftItem.tokenId}</div>
              </div>
              <div className="modal-dialog-fields">
                <CssTextField
                  required
                  label="Max lend duration"
                  id={`${nftItem.tokenId}::maxDuration`}
                  variant="outlined"
                  value={lendOneInputs[nftItem.tokenId]?.maxDuration ?? ""}
                  type="number"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name={`${nftItem.tokenId}::maxDuration`}
                />
                <CssTextField
                  required
                  label="Borrow Price"
                  id={`${nftItem.tokenId}::borrowPrice`}
                  variant="outlined"
                  value={lendOneInputs[nftItem.tokenId]?.borrowPrice ?? ""}
                  type="number"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name={`${nftItem.tokenId}::borrowPrice`}
                />
                <CssTextField
                  required
                  label="Collateral"
                  id={`${nftItem.tokenId}::nftPrice`}
                  variant="outlined"
                  value={lendOneInputs[nftItem.tokenId]?.nftPrice ?? ""}
                  type="number"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name={`${nftItem.tokenId}::nftPrice`}
                />
                <MinimalSelect
                  // @ts-ignore
                  onSelect={(value) =>
                    onSelectPaymentToken(value, nftItem.tokenId)
                  }
                  selectedValue={pmtToken[nftItem.tokenId] ?? -1}
                />
              </div>
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
