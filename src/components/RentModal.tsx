import React, { useCallback, useState, useContext, useMemo } from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { TextField, Box, withStyles } from "@material-ui/core";
import * as R from "ramda";
import moment from "moment";

// contexts
import ContractsContext from "../contexts/Contracts";
import FunnySpinner from "./Spinner";
import RainbowButton from "./RainbowButton";
import CssTextField from "./CssTextField";
import Modal from "./Modal";
import { Lending } from "../types";

const SENSIBLE_MAX_DURATION = 10 * 365;

const useStyles = makeStyles(() =>
  createStyles({
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
  })
);

const LegibleTextField = withStyles({
  root: {
    "& .MuiFormLabel-root.Mui-disabled": {
      color: "white",
    },
  },
})(TextField);

type RentModalProps = {
  open: boolean;
  handleClose: () => void;
  lending: Lending;
};

const DEFAULT_ERROR_TEXT = "Must be a natural number e.g. 1, 2, 3";

const RentModal: React.FC<RentModalProps> = ({
  open,
  handleClose,
  lending,
}) => {
  const classes = useStyles();
  const { rent } = useContext(ContractsContext);
  const [duration, setDuration] = useState<string>("");
  const [busy, setIsBusy] = useState(false);
  const [totalRent, setTotalRent] = useState(0);
  const [inputsValid, setInputsValid] = useState(true);
  const [errorText, setErrorText] = useState(DEFAULT_ERROR_TEXT);
  const [returnDate, setReturnDate] = useState("");

  const resetState = useCallback(() => {
    setInputsValid(false);
    setTotalRent(0);
    setDuration("");
    setReturnDate("👾");
    setErrorText(DEFAULT_ERROR_TEXT);
  }, []);

  // TODO: ensure that the time is correct for different locales
  const setDate = useCallback((days: string) => {
    const returnOn = moment().add(days, "day");
    setReturnDate(returnOn.format("MMMM Do YYYY, h:mm:ss a"));
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.persist();
      const val = e.target.value;
      let resolvedValue = val;

      try {
        // some value that has two or more dots in it, will deem the state to be invalid
        const dots = val.match(/[.]{2,}/g) || [];
        if (dots.length > 0) {
          resetState();
          return;
        }

        if (val.length > 0 && val.startsWith("0")) {
          // we reset to "0" if the user typed in something silly
          // if they start typing a valid number, we remove "0" and give them their number
          const val = resolvedValue.match(/[^0*](\d*)/g);
          if (val) resolvedValue = val[0];
        }

        const num = Number(val);

        // if we get weird inputs, reset them to sensible values
        if (val === "" || num < 1) {
          resetState();
          return;
        } else if (num >= SENSIBLE_MAX_DURATION) {
          resetState();
          setDuration(String(SENSIBLE_MAX_DURATION));
          return;
        } else if (num > lending.maxRentDuration) {
          resetState();
          setErrorText(
            `You cannot borrow this NFT for longer than ${lending.maxRentDuration} days`
          );
          return;
        }

        // if the above conditions weren't caught, everything is fine
        setInputsValid(true);
        setTotalRent(num * lending.dailyRentPrice);
      } catch (err) {
        console.debug("could not convert rent duration to number");
        resetState();
      }

      setDuration(resolvedValue);
      setDate(resolvedValue);
    },
    [lending, resetState, setDate]
  );

  const rentIsDisabled = useMemo(() => {
    return !inputsValid || !duration || busy;
  }, [inputsValid, duration, busy]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        // TODO: to generalise, will need to use tokenAddress here too

        if (
          !rent ||
          // !R.hasPath(["dai", "approve"], pmtToken) ||
          rentIsDisabled
        ) {
          console.debug("can't rent");
          return;
        }

        setIsBusy(true);

        const pmtTokenAddress = await resolver.getPaymentToken(
          lending.paymentToken
        );

        // todo: approve
        // await pmtToken.dai.approve();
        await rent.rentOne(
          lending.nftAddress,
          String(lending.tokenId),
          String(lending.id),
          duration // todo: add gas sponsor
        );
      } catch (err) {
        console.debug("something went wrong");
        // TODO: give a notification here as well
      }
      setIsBusy(false);
      handleClose();
    },
    [
      rent,
      duration,
      rentIsDisabled,
      lending.id,
      lending.tokenId,
      lending.nftAddress,
      handleClose,
    ]
  );

  // const handleApprove = useCallback(async () => {
  //   try {
  //     setIsBusy(true);
  //     await pmtToken.dai.approve();
  //   } catch (err) {
  //     handleClose();
  //     console.debug("could not approve");
  //   }
  //   setIsBusy(false);
  // }, [pmtToken, handleClose]);

  return (
    <Modal open={open} handleClose={handleClose}>
      <Box style={{ padding: "32px" }}>
        {busy && <FunnySpinner />}
        <Box className={classes.inputs}>
          <CssTextField
            required
            label="Rent duration"
            id="duration"
            variant="outlined"
            type="number"
            name="rentDuration"
            value={duration}
            error={!inputsValid}
            helperText={!inputsValid ? errorText : ""}
            onChange={handleChange}
          />
          <LegibleTextField
            id="standard-basic"
            label={`Daily rent price: ${lending.dailyRentPrice}`}
            disabled
          />
          <LegibleTextField
            id="standard-basic"
            label={`Rent: ${lending.dailyRentPrice} x ${
              !duration ? "👾" : duration
            } days = ${
              totalRent === 0 ? "e ^ (i * π) + 1" : totalRent.toFixed(2)
            }`}
            disabled
          />
          <LegibleTextField
            id="standard-basic"
            label={`Collateral: ${lending.nftPrice}`}
            disabled
          />
          <Box
            className={classes.buttons}
            style={{ paddingBottom: "16px" }}
          ></Box>
          <Box>
            <p>
              You <span style={{ fontWeight: "bold" }}>must</span> return the
              NFT by {returnDate}, or you{" "}
              <span style={{ fontWeight: "bold" }}>will lose</span> the
              collateral
            </p>
          </Box>
        </Box>

        <Box className={classes.buttons}>
          <button
            type="button"
            style={{
              border: "3px solid black",
            }}
            className="Product__button"
            // onClick={handleApprove}
            disabled={busy}
          >
            Approve fDAI
          </button>
          {/* TODO: visual cues to indicate that Rent button is disabled */}
          {/* TODO: consider adding form to be consistent (like in LendModal) */}
          <Box onClick={handleSubmit}>
            <RainbowButton
              type="submit"
              text="Rent"
              disabled={rentIsDisabled}
            />
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default RentModal;
