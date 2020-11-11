import React, { useContext, useState, useCallback } from "react";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

// contexts
import ContractsContext from "../contexts/Contracts";
import DappContext from "../contexts/Dapp";
import FunnySpinner from "./Spinner";
import RainbowButton from "./RainbowButton";
import Modal from "./Modal";
import CssTextField from "./CssTextField";

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

enum lendOneInput {
  maxDuration,
  borrowPrice,
  nftPrice,
}

type LendOneInputs = {
  maxDuration: string;
  borrowPrice: string;
  nftPrice: string;
};

type LendModalProps = {
  faceId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const LendModal: React.FC<LendModalProps> = ({ faceId, open, setOpen }) => {
  const classes = useStyles();
  const { rent, face } = useContext(ContractsContext);
  const { web3 } = useContext(DappContext);

  const [lendOneInputs, setLendOneInputs] = useState<LendOneInputs>({
    maxDuration: "7",
    borrowPrice: "10",
    nftPrice: "100",
  });
  const [isBusy, setIsBusy] = useState(false);

  const handleLend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (web3 == null) {
      return;
    }

    setIsBusy(true);
    try {
      const tokenId = faceId.split("::")[1];
      const account = await face.getApproved(tokenId);
      const wallet = await web3.eth.getAccounts();
      if (account === wallet[0]) {
        await face.approveNft(tokenId);
      }
      await rent.lendOne(
        tokenId,
        // ! careful. will fail if the stablecoin / ERC20 is not 18 decimals
        web3.utils.toWei(
          Number(lendOneInputs.maxDuration).toFixed(18),
          "ether"
        ),
        web3.utils.toWei(
          Number(lendOneInputs.borrowPrice).toFixed(18),
          "ether"
        ),
        web3.utils.toWei(Number(lendOneInputs.nftPrice).toFixed(18), "ether")
      );
    } catch (err) {
      console.debug("could not complete the lending");
    }

    // show green check mark somewhere too
    setIsBusy(false);
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ! this wasted an hour of my life: https://duncanleung.com/fixing-react-warning-synthetic-events-in-setstate/
    e.persist();
    // ! if setting the state based on the previous state values, you should use a function
    setLendOneInputs((lendOneInputs) => ({
      ...lendOneInputs,
      [e.target.name]: e.target.value,
    }));
  };

  const isValid = (n: string, t: lendOneInput) => {
    if (t === lendOneInput.maxDuration) {
      // must be an integer
      return !n.includes(".") && Number(n) > 0;
    } else if (t === lendOneInput.borrowPrice || t === lendOneInput.nftPrice) {
      return Number(n) >= 0;
    } else {
      console.debug("exhaustive check failed");
      return false;
    }
  };

  // this will ensure that spinner halts if the user rejects the txn
  const handleApproveAll = useCallback(async () => {
    setIsBusy(true);

    try {
      await face.approveOfAllFaces();
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
            error={
              !isValid(lendOneInputs.maxDuration, lendOneInput.maxDuration)
            }
            label="Max lend duration"
            id="maxDuration"
            variant="outlined"
            value={lendOneInputs.maxDuration}
            type="number"
            helperText={
              !isValid(lendOneInputs.maxDuration, lendOneInput.maxDuration)
                ? "Must be a natural number"
                : ""
            }
            onChange={handleChange}
            name="maxDuration"
            disabled={isBusy}
          />
          <CssTextField
            required
            error={
              !isValid(lendOneInputs.borrowPrice, lendOneInput.borrowPrice)
            }
            label="Borrow Price"
            id="borrowPrice"
            variant="outlined"
            value={lendOneInputs.borrowPrice}
            type="number"
            helperText={
              !isValid(lendOneInputs.borrowPrice, lendOneInput.borrowPrice)
                ? "Must be a zero or a positive decimal"
                : ""
            }
            onChange={handleChange}
            name="borrowPrice"
            disabled={isBusy}
          />
          <CssTextField
            required
            error={!isValid(lendOneInputs.nftPrice, lendOneInput.nftPrice)}
            label="Collateral"
            id="nftPrice"
            variant="outlined"
            value={lendOneInputs.nftPrice}
            type="number"
            helperText={
              !isValid(lendOneInputs.nftPrice, lendOneInput.nftPrice)
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
            }}
            className="Product__button"
            onClick={handleApproveAll}
            disabled={isBusy}
            onSubmit={preventDefault}
          >
            Approve all
          </button>
          <RainbowButton type="submit" text="Lend" disabled={isBusy} />
        </Box>
      </form>
    </Modal>
  );
};

export default LendModal;
