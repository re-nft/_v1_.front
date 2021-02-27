import React, { useState, useCallback, useContext, useEffect } from "react";
import { Box } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import { BigNumber } from "ethers";

import { decimalToPaddedHexString } from "../../utils";
import { Nft, PaymentToken } from "../../types";
import RainbowButton from "../RainbowButton";
import CssTextField from "../CssTextField";
import Modal from "../Modal";
import MinimalSelect from "../MinimalSelect";
import {
  CurrentAddressContext,
  RentNftContext,
} from "../../hardhat/SymfoniContext";
import { TransactionStateContext } from "../../contexts/TransactionState";
import GraphContext from "../../contexts/Graph";
import ApproveButton from "./ApproveButton";
import { useStyles } from "./styles";

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
  nft: Nft & { isApproved: boolean };
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
  const { isActive, setHash, hash } = useContext(TransactionStateContext);
  const [currentAddress] = useContext(CurrentAddressContext);
  const { fetchAvailableNfts } = useContext(GraphContext);
  const [pmtToken, setPmtToken] = useState<PaymentToken>(PaymentToken.DAI);
  const [lendOneInputs, setLendOneInputs] = useState<LendOneInputs>(
    DefaultLendOneInputs
  );
  const [isOwn, setIsOwn] = useState<boolean>(true);
  const [isApproved, setIsApproved] = useState<boolean>(false);

  const _setIsApproved = useCallback(() => {
    setIsApproved(true);
  }, []);

  const fetchOwnerOfNft = useCallback(
    async (nft: Nft) => {
      if (!nft.contract) return;
      const owner = await nft.contract.ownerOf(nft.tokenId);
      if (owner.toLowerCase() !== currentAddress.toLowerCase()) {
        setIsOwn(false);
      }
      setIsOwn(true);
    },
    [currentAddress]
  );

  const fetchOwner = useCallback(async () => {
    fetchOwnerOfNft(nft);
  }, [nft, fetchOwnerOfNft]);

  useEffect(() => {
    fetchOwnerOfNft(nft);
  }, [fetchOwner, fetchOwnerOfNft, nft]);

  const handleLend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!nft || !renft || isActive || !nft.contract) return;
      // need to approve if it wasn't: nft
      const tx = await renft.lend(
        [nft.contract.address],
        [nft.tokenId],
        [BigNumber.from(lendOneInputs.maxDuration.value)],
        [decimalToPaddedHexString(Number(lendOneInputs.borrowPrice.value), 32)], // min 0.0001 max number 9_999.9999
        [decimalToPaddedHexString(Number(lendOneInputs.nftPrice.value), 32)], // min 0.0001 max number 9_999.9999
        [pmtToken.toString()]
      );

      setHash(tx.hash);
      setOpen(false);
      fetchAvailableNfts();
    },
    [
      nft,
      renft,
      setHash,
      setOpen,
      isActive,
      fetchAvailableNfts,
      lendOneInputs,
      pmtToken,
    ]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const target = e.target.name;
      const value = e.target.value;
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

  const onHandleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const target = e.target.name;
      const value = e.target.value;
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

  const onSelectPaymentToken = useCallback(
    (value: number) => setPmtToken(value),
    []
  );
  const handleClose = useCallback(() => setOpen(false), [setOpen]);
  // TODO: add tooltip for borrowPrice and nftPrice
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
            onBlur={onHandleBlur}
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
            onBlur={onHandleBlur}
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
            onBlur={onHandleBlur}
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
          {!isApproved && !nft.isApproved && (
            <ApproveButton nft={nft} callback={_setIsApproved} />
          )}
          <RainbowButton
            type="submit"
            text="Lend"
            disabled={(!isApproved && !nft.isApproved) || !isOwn}
          />
        </Box>
      </form>
    </Modal>
  );
};

export default LendModal;
