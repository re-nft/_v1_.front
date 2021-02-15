import React, { useState, useCallback, useContext, useEffect } from "react";
import { Box } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";

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
      console.log("owner", owner);
      console.log("currentAddress", currentAddress);
      if (owner.toLowerCase() !== currentAddress.toLowerCase()) {
        console.log("isOwn false");
        setIsOwn(false);
      }
      console.log("isOwn true");
      console.log("isApproved", isApproved);
      setIsOwn(true);
    },
    [currentAddress, isApproved]
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
        ["3"],
        ["0x00000011"],
        ["0x00000101"],
        ["1"]
      );

      setHash(tx.hash);
      fetchAvailableNfts();
    },
    [nft, renft, setHash, isActive, fetchAvailableNfts]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ! this wasted an hour of my life: https://duncanleung.com/fixing-react-warning-synthetic-events-in-setstate/
    e.persist();
    const target = e.target.name;
    const val = e.target.value;

    setLendOneInputs((lendOneInputs) => ({
      ...lendOneInputs,
      [target]: {
        value: val,
        valid: true,
      },
    }));
  };

  const handleClose = useCallback(() => setOpen(false), [setOpen]);

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
            name="nftPrice"
          />
          <FormControl variant="outlined">
            <MinimalSelect />
          </FormControl>
        </Box>
        <Box className={classes.buttons}>
          {!isApproved && <ApproveButton nft={nft} callback={_setIsApproved} />}
          <RainbowButton
            type="submit"
            text="Lend"
            disabled={!isApproved || !isOwn}
          />
        </Box>
      </form>
    </Modal>
  );
};

export default LendModal;
