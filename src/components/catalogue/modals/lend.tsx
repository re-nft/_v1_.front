import React, { useState, useCallback, useContext, useEffect } from "react";
import { Box } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import { ProviderContext } from "../../../hardhat/SymfoniContext";
import { PaymentToken } from "../../../types";
import RainbowButton from "../../rainbow-button";
import CssTextField from "../../css-text-field";
import Modal from "../../modal";
import MinimalSelect from "../../MinimalSelect";
import {
  CurrentAddressContext,
  RentNftContext,
} from "../../../hardhat/SymfoniContext";
import { TransactionStateContext } from "../../../contexts/TransactionState";
import GraphContext from "../../../contexts/graph";
import { ERCNft } from "../../../contexts/graph/types";
import { useStyles } from "./styles";
import startLend from "../../../services/start-lend";
import ActionButton from "../../action-button";

type ValueValid = {
  value: string;
  valid: boolean;
};

type LendOneInputs = {
  maxDuration: ValueValid;
  borrowPrice: ValueValid;
  nftPrice: ValueValid;
};

type NFT = {
  contract?: ERCNft["contract"];
  tokenId?: ERCNft["tokenId"];
};

type LendModalProps = {
  nft: NFT;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DefaultLendOneInputs = {
  maxDuration: {
    value: "7",
    valid: true,
  },
  borrowPrice: {
    value: "10",
    valid: true,
  },
  nftPrice: {
    value: "100",
    valid: true,
  },
};

export const LendModal: React.FC<LendModalProps> = ({ nft, open, setOpen }) => {
  const classes = useStyles();
  const { instance: renft } = useContext(RentNftContext);
  const { isActive, setHash } = useContext(TransactionStateContext);
  const { fetchMyNfts } = useContext(GraphContext);
  const [currentAddress] = useContext(CurrentAddressContext);
  const [pmtToken, setPmtToken] = useState<PaymentToken>(PaymentToken.DAI);
  const [provider] = useContext(ProviderContext);
  const [isApproved, setIsApproved] = useState<boolean>();
  const [lendOneInputs, setLendOneInputs] = useState<LendOneInputs>(
    DefaultLendOneInputs
  );

  const handleLend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!renft || isActive || !nft.contract || !nft.tokenId) return;

      const { maxDuration, borrowPrice, nftPrice } = lendOneInputs;
      const tx = await startLend(
        renft,
        nft,
        maxDuration.value,
        borrowPrice.value,
        nftPrice.value,
        pmtToken
      );

      setHash(tx.hash);
      setOpen(false);
      fetchMyNfts();
    },
    [
      nft,
      renft,
      setHash,
      setOpen,
      isActive,
      fetchMyNfts,
      lendOneInputs,
      pmtToken,
    ]
  );

  const handleApproveAll = useCallback(
    async (nft: NFT) => {
      if (!currentAddress || !renft || isActive || !nft.contract || !provider)
        return;
      const tx = await nft.contract.setApprovalForAll(renft.address, true);
      setHash(tx.hash);
      const receipt = await provider.getTransactionReceipt(tx.hash);
      const status = receipt.status ?? 0;
      if (status === 1) {
        setIsApproved(true);
      }
    },
    [currentAddress, renft, nft.contract, isActive, setHash, provider]
  );

  const handleStateChange = useCallback(
    (target: string, value: string) => {
      setLendOneInputs({
        ...lendOneInputs,
        [target]: {
          value,
          valid: true,
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
    (value: number) => setPmtToken(value),
    []
  );

  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  const checkIsApproved = useCallback(async () => {
    if (!currentAddress || !renft?.instance || !nft.contract || !nft.tokenId)
      return false;
    const _isApproved = await nft.contract
      .isApprovedForAll(currentAddress, renft.instance.address ?? "")
      .then((r) => r)
      .catch(() => false);
    setIsApproved(_isApproved);
  }, [currentAddress, nft.contract, renft?.instance, nft.tokenId]);

  useEffect(() => {
    checkIsApproved();
  }, []);

  return (
    <Modal open={open} handleClose={handleClose}>
      <form
        noValidate
        autoComplete="off"
        onSubmit={handleLend}
        className={classes.form}
        style={{ padding: "32px" }}
      >
        <Box className={classes.inputs}>
          {/* todo: below CssTextFields are not DRY */}
          <CssTextField
            required
            error={!lendOneInputs.maxDuration.valid}
            label="Max lend duration"
            id="maxDuration"
            variant="outlined"
            value={lendOneInputs.maxDuration.value}
            type="number"
            helperText={
              !lendOneInputs.maxDuration.valid ? "Must be a natural number" : ""
            }
            onChange={handleChange}
            onBlur={handleBlur}
            name="maxDuration"
          />
          <CssTextField
            required
            error={!lendOneInputs.borrowPrice.valid}
            label="Borrow Price"
            id="borrowPrice"
            variant="outlined"
            value={lendOneInputs.borrowPrice.value}
            type="number"
            helperText={
              !lendOneInputs.borrowPrice.valid
                ? "Must be a zero or a positive decimal"
                : ""
            }
            onChange={handleChange}
            onBlur={handleBlur}
            name="borrowPrice"
          />
          <CssTextField
            required
            error={!lendOneInputs.nftPrice.valid}
            label="Collateral"
            id="nftPrice"
            variant="outlined"
            value={lendOneInputs.nftPrice.value}
            type="number"
            helperText={
              !lendOneInputs.nftPrice.valid
                ? "Must be a zero or a positive decimal"
                : ""
            }
            onChange={handleChange}
            onBlur={handleBlur}
            name="nftPrice"
          />
          <FormControl variant="outlined">
            <MinimalSelect
              onSelect={onSelectPaymentToken}
              selectedValue={pmtToken}
            />
          </FormControl>
        </Box>
        <Box className={classes.buttons}>
          {!isApproved && (
            <ActionButton
              title="Approve all"
              nft={nft}
              onClick={handleApproveAll}
            />
          )}
          {isApproved && (
            <RainbowButton type="submit" text="Lend" disabled={!isApproved} />
          )}
        </Box>
      </form>
    </Modal>
  );
};

export default LendModal;
