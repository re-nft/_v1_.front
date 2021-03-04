import React, { useState, useCallback, useContext, useEffect } from "react";
import { Box } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import { ProviderContext } from "../../../hardhat/SymfoniContext";
import { PaymentToken } from "../../../types";
import RainbowButton from "../../forms/rainbow-button";
import CssTextField from "../../forms/css-text-field";
import Modal from "./modal";
import MinimalSelect from "../../select";
import {
  CurrentAddressContext,
  RentNftContext,
} from "../../../hardhat/SymfoniContext";
import { TransactionStateContext } from "../../../contexts/TransactionState";
import { Nft } from "../../../contexts/graph/classes";
import { useStyles } from "./styles";
import startLend from "../../../services/start-lend";
import isApprovedForAll from "../../../services/is-approval-for-all";
import ActionButton from "../../forms/action-button";

type ValueValid = {
  value: string;
  valid: boolean;
};

type LendOneInputs = {
  maxDuration: ValueValid;
  borrowPrice: ValueValid;
  nftPrice: ValueValid;
};

type LendModalProps = {
  nft: Nft;
  open: boolean;
  onClose(): void;
};

const defaulLandValue = {
  value: "",
  valid: true,
};

const DefaultLendOneInputs = {
  maxDuration: defaulLandValue,
  borrowPrice: defaulLandValue,
  nftPrice: defaulLandValue,
};

export const LendModal: React.FC<LendModalProps> = ({ nft, open, onClose }) => {
  const classes = useStyles();
  const { instance: renft } = useContext(RentNftContext);
  const { isActive, setHash } = useContext(TransactionStateContext);
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
      onClose();
    },
    [nft, renft, setHash, onClose, isActive, lendOneInputs, pmtToken]
  );

  const handleApproveAll = useCallback(
    async (nft: Nft) => {
      if (!currentAddress || !renft || isActive || !provider) return;
      const contract = await nft.contract();
      const tx = await contract.setApprovalForAll(renft.address, true);
      setHash(tx.hash);
      const receipt = await provider.getTransactionReceipt(tx.hash);
      const status = receipt.status ?? 0;
      if (status === 1) {
        setIsApproved(true);
      }
    },
    [currentAddress, renft, isActive, setHash, provider, setIsApproved]
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

  const checkIsApproved = useCallback(async () => {
    if (!currentAddress || !renft) return false;
    const contract = await nft.contract();
    const isApproved = await isApprovedForAll(renft, contract, currentAddress);
    setIsApproved(isApproved);
  }, [currentAddress, renft, nft]);

  useEffect(() => {
    checkIsApproved();
  }, [checkIsApproved]);

  return (
    <Modal open={open} handleClose={onClose}>
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
