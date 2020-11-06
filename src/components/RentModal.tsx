import React, { useCallback, useState, useContext } from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { TextField, Box } from "@material-ui/core";
import * as R from "ramda";

// contexts
import ContractsContext from "../contexts/Contracts";
import FunnySpinner from "./Spinner";
import RainbowButton from "./RainbowButton";
import CssTextField from "./CssTextField";
import Modal from "./Modal";

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

type RentModalProps = {
  faceId: string;
  open: boolean;
  handleClose: () => void;
  borrowPrice: number;
  nftPrice: number;
};

const RentModal: React.FC<RentModalProps> = ({
  faceId,
  open,
  handleClose,
  borrowPrice,
  nftPrice,
}) => {
  const classes = useStyles();
  const { rent, pmtToken } = useContext(ContractsContext);
  const [duration, setDuration] = useState<string>("");
  const [busy, setIsBusy] = useState(false);
  const [totalRent, setTotalRent] = useState(0);
  const [inputsValid, setInputsValid] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();
    try {
      Number(e.target.value);
      setInputsValid(true);
      setTotalRent(Number(e.target.value) * borrowPrice);
    } catch (err) {
      setInputsValid(false);
      console.debug("could not convert rent duration to number");
      setTotalRent(0);
    }
    if (e.target.value.includes(".")) {
      setInputsValid(false);
      setTotalRent(0);
    }
    setDuration(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      // setFaceId(tokenId);
      const tokenId = faceId.split("::")[1];

      if (
        !rent ||
        !pmtToken ||
        !R.hasPath(["dai", "approve"], pmtToken) ||
        !inputsValid
      ) {
        console.debug("can't rent");
        return;
      }

      setIsBusy(true);
      // TODO: approve conditional (only approve if not approved before)
      await pmtToken.dai.approve();
      await rent.rentOne(tokenId, duration!.toString());
      setIsBusy(false);
    },
    [rent, pmtToken, duration, faceId, inputsValid]
  );

  return (
    <Modal open={open} onClose={handleClose}>
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
            error={inputsValid}
            helperText={"Must be a natural number e.g. 1, 2, 3"}
            onChange={handleChange}
          />
          <TextField
            id="standard-basic"
            label={`Daily rent price: ${borrowPrice}`}
            disabled
          />
          <TextField
            id="standard-basic"
            label={`Rent: ${borrowPrice} x ${
              !duration ? "👾" : duration
            } days = ${
              totalRent === 0 ? "e ^ (i * π) + 1" : totalRent.toFixed(2)
            }`}
            disabled
          />
          <TextField
            id="standard-basic"
            label={`Collateral: ${nftPrice}`}
            disabled
          />
          <Box
            className={classes.buttons}
            style={{ paddingBottom: "16px" }}
          ></Box>
          <Box>
            <p>
              {`You must return the NFT by xxx, or you will lose the collateral`}
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
          >
            Approve fDAI
          </button>
          <RainbowButton type="submit" text="Rent" disabled={busy} />
        </Box>
      </Box>
    </Modal>
  );
};

export default RentModal;
