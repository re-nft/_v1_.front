import React, {
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import ContractsContext from "../contexts/Contracts";
import DappContext from "../contexts/Dapp";
import { Nft, PaymentToken } from "../types";
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
  nft?: Nft;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const LendModal: React.FC<LendModalProps> = ({ nft, open, setOpen }) => {
  const classes = useStyles();
  const { face, erc721, rent, helpers } = useContext(ContractsContext);
  const { packPrice } = helpers;
  const { web3, addresses } = useContext(DappContext);
  const [isApproved, setIsApproved] = useState<boolean>(false);

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

  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (!nft?.tokenId) return;
    face
      .isApproved(nft.tokenId)
      .then((_isApproved) => {
        setIsApproved(_isApproved);
      })
      .catch((_) => {
        console.debug("could not check if the NFT is approved");
        setIsApproved(false);
      });
  }, [face, nft?.tokenId]);

  const handleLend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!web3) return;

    let isSuccessfulLend = false;

    setIsBusy(true);
    try {
      if (!nft?.tokenId || !addresses?.rent) return;

      if (!isApproved) {
        await erc721.approve(nft.nftAddress, addresses.rent, nft.tokenId);
      }

      const packedDailyRentPrice = packPrice(
        Number(lendOneInputs.borrowPrice.value)
      );
      const packedNftPrice = packPrice(Number(lendOneInputs.nftPrice.value));
      if (!packedDailyRentPrice || !packedNftPrice) {
        console.warn("the price is too high");
        return;
      }

      // nftAddress, tokenId, maxRentDuration, dailyRentPrice
      // nftPrice, paymentToken, gasSponsor?
      await rent.lendOne(
        nft.nftAddress,
        nft.tokenId,
        // ! careful. will fail if the stablecoin / ERC20 is not 18 decimals
        lendOneInputs.maxDuration.value,
        packedDailyRentPrice,
        packedNftPrice,
        // TODO: change for whatever token. add the dropdown on the front-end
        PaymentToken.DAI
      );

      isSuccessfulLend = true;
    } catch (err) {
      // TODO: notification that something went wrong
      // TRELLO TASK: https://trello.com/c/FUhFdVR4/48-2-add-notifications-anywhere-you-can
      console.debug("could not complete the lending");
    }

    // show green check mark somewhere too
    setIsBusy(false);
    setOpen(false);

    // when successfully lent out, hide the NFT from the front-end
    if (isSuccessfulLend) {
      // todo:
    }
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
    let updateSuccess = false;

    try {
      await face.approveAll();
      updateSuccess = true;
    } catch (e) {
      console.debug("could not approve all the faces");
    }

    if (updateSuccess) setIsApproved(true);
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
            disabled={isBusy}
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
          <Box
            style={{
              display: isApproved ? "inherit" : "none",
            }}
          >
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
