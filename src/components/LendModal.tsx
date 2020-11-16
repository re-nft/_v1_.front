import React, { useContext, useState, useCallback, useMemo } from "react";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { addresses } from "../contracts";

// contexts
import ContractsContext from "../contexts/Contracts";
import DappContext from "../contexts/Dapp";
import GraphContext from "../contexts/Graph";
import FunnySpinner from "./Spinner";
import RainbowButton from "./RainbowButton";
import Modal from "./Modal";
import CssTextField from "./CssTextField";
import { Address } from "../types";

// TODO: this is a copy of what we have in RentModal
const useStyles = makeStyles({
  form: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
  },
  inputs: {
    display: "flex",
    flexDirection: "column",
    padding: "32px",
    // matches direct div children of inputs
    "& > div": {
      marginBottom: "16px",
    },
    margin: "0 auto",
  },
  buttons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },
});

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
  faceId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
};

type NftAndId = {
  nftAddress: Address;
  tokenId: string;
};

const LendModal: React.FC<LendModalProps> = ({ faceId, open, setOpen }) => {
  const classes = useStyles();
  const { rent, face } = useContext(ContractsContext);
  const { web3 } = useContext(DappContext);
  const { isApproved: _isApproved } = useContext(GraphContext);

  const [lendOneInputs, setLendOneInputs] = useState<LendOneInputs>({
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
  });

  const getNftAndId: NftAndId = useMemo(() => {
    const parts = faceId.split("::");
    if (parts.length < 2) {
      return {
        nftAddress: "",
        tokenId: "",
      };
    }
    return {
      nftAddress: parts[0],
      tokenId: parts[1],
    };
  }, [faceId]);

  // TODO: to avoid complexity of sustaining the approve events and this additional logic around
  // checking if approved, just add a call to the ERC721 to check if approved and keep in state
  const isApproved = useMemo(() => {
    const { nftAddress, tokenId } = getNftAndId;
    return _isApproved(addresses.goerli.rent, nftAddress, tokenId);
  }, [_isApproved, getNftAndId]);

  const [isBusy, setIsBusy] = useState(false);

  const handleLend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!web3) return;

    setIsBusy(true);
    try {
      const tokenId = faceId.split("::")[1];
      const account = await face.isApproved(tokenId);
      const isApproved = await face.isApprovedAll();
      if (!(isApproved || account === addresses.goerli.rent)) {
        await face.approve(tokenId);
      }
      await rent.lendOne(
        tokenId,
        // ! careful. will fail if the stablecoin / ERC20 is not 18 decimals
        lendOneInputs.maxDuration.value,
        web3.utils.toWei(
          Number(lendOneInputs.borrowPrice.value).toFixed(18),
          "ether"
        ),
        web3.utils.toWei(
          Number(lendOneInputs.nftPrice.value).toFixed(18),
          "ether"
        )
      );
    } catch (err) {
      // ! TODO: NOTIFICATION THAT SOMETHING WENT WRONG
      // TRELLO TASK: https://trello.com/c/FUhFdVR4/48-2-add-notifications-anywhere-you-can
      console.debug("could not complete the lending");
    }

    // show green check mark somewhere too
    setIsBusy(false);
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ! this wasted an hour of my life: https://duncanleung.com/fixing-react-warning-synthetic-events-in-setstate/
    e.persist();
    const target = e.target.name;
    const val = e.target.value;

    let valid = true;
    if (target === "maxDuration") {
      valid = checkMaxDuration(val);
    } else if (target === "borrowPrice" || target === "nftPrice") {
      valid = checkPrice(val);
    }

    // ! if setting the state based on the previous state values, you should use a function
    setLendOneInputs((lendOneInputs) => ({
      ...lendOneInputs,
      [target]: {
        value: val,
        valid,
      },
    }));
  };

  const checkPrice = (n: string) => {
    return n !== "" && Number(n) >= 0;
  };

  const checkMaxDuration = (n: string) => {
    return !n.includes(".") && checkPrice(n);
  };

  const allValid = useMemo(() => {
    return Object.values(lendOneInputs).every((item) => item.valid);
  }, [lendOneInputs]);

  // this will ensure that spinner halts if the user rejects the txn
  const handleApproveAll = useCallback(async () => {
    setIsBusy(true);

    try {
      await face.approveAll();
    } catch (e) {
      console.debug("could not approve all the faces");
    }

    setIsBusy(false);
  }, [face]);

  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  const preventDefault = (e: React.FormEvent) => e.preventDefault();

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
            disabled={isBusy}
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
            disabled={isBusy}
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
            disabled={isBusy}
          />
        </Box>
        <Box>{isBusy && <FunnySpinner />}</Box>
        <Box className={classes.buttons}>
          <button
            type="button"
            style={{
              border: "3px solid black",
              display: isApproved ? "none" : "inherit",
            }}
            className="Product__button"
            onClick={handleApproveAll}
            onSubmit={preventDefault}
          >
            Approve all
          </button>
          <Box style={{ display: isApproved ? "inherit" : "none" }}>
            <RainbowButton
              type="submit"
              text="Lend"
              disabled={isBusy || !allValid}
            />
          </Box>
        </Box>
      </form>
    </Modal>
  );
};

export default LendModal;
