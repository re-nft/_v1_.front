import React, { useState, useCallback, useContext, useEffect } from "react";
import { Box } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import { BigNumber } from "ethers";

import { decimalToPaddedHexString } from "../../utils";
import { PaymentToken } from "../../types";
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
import { ERCNft } from "../../contexts/Graph/types";
import ApproveButton from "../ApproveButton";
import { useStyles } from "./styles";
import { SECOND_IN_MILLISECONDS } from "../../consts";
import usePoller from "../../hooks/usePoller";

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
  nft: {
    contract?: ERCNft["contract"];
    tokenId?: ERCNft["tokenId"];
  };
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
  const { fetchAvailableNfts } = useContext(GraphContext);
  const [currentAddress] = useContext(CurrentAddressContext);
  const [pmtToken, setPmtToken] = useState<PaymentToken>(PaymentToken.DAI);
  const [lendOneInputs, setLendOneInputs] = useState<LendOneInputs>(
    DefaultLendOneInputs
  );
  const [isApproved, setIsApproved] = useState<boolean>();

  const handleLend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!renft || isActive || !nft.contract || !nft.tokenId) return;
      // need to approve if it wasn't: nft
      // * mocks only allow two payment tokens right now
      // ETH and DAI
      // indices of these, as per contracts repo/src/Resolver.sol are: 1 and 2
      // only the above will work in the development environment for now
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
    (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.FocusEvent<HTMLInputElement>
    ) => {
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

  const checkIsApproved = useCallback(async () => {
    if (!currentAddress || !renft?.instance || !nft.contract || !nft.tokenId)
      return false;
    const _isApproved = await nft.contract
      .isApprovedForAll(currentAddress, renft.instance.address ?? "")
      .then((r) => r)
      .catch(() => false);
    setIsApproved(_isApproved);
  }, [currentAddress, nft.contract, renft?.instance, nft.tokenId]);

  usePoller(checkIsApproved, 2 * SECOND_IN_MILLISECONDS);

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
          {!isApproved && <ApproveButton nft={nft} />}
          <RainbowButton type="submit" text="Lend" disabled={!isApproved} />
        </Box>
      </form>
    </Modal>
  );
};

export default LendModal;
