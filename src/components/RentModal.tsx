import React, { useCallback, useState, useContext } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { TextField, Box } from "@material-ui/core";
import * as R from "ramda";

// contexts
import ContractsContext from "../contexts/Contracts";
import FunnySpinner from "./Spinner";
import RainbowButton from "./RainbowButton";
import CssTextField from "./CssTextField";
import Modal from "./Modal";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    swanky: {
      width: "600px",
      backgroundColor: "#663399",
      margin: "auto",
      border: "3px solid #000",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
      color: "white",
      textAlign: "center",
      top: "30% !important",
      left: "35% !important",
      right: "unset !important",
      bottom: "unset !important",
    },
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
      width: "60%",
      // matches direct div children
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
};

const RentModal: React.FC<RentModalProps> = ({ faceId, open, handleClose }) => {
  const classes = useStyles();
  const { rent, pmtToken } = useContext(ContractsContext);
  const [duration, setDuration] = useState<string>("");
  const [busy, setIsBusy] = useState(false);
  const [inputsValid, setInputsValid] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();
    try {
      Number(e.target.value);
      setInputsValid(true);
    } catch (err) {
      setInputsValid(false);
      console.debug("could not convert rent duration to number");
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
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <Box>
        <Box className={classes.inputs}>
          <CssTextField
            required
            label="Rent duration"
            id="duration"
            variant="outlined"
            type="number"
            name="rentDuration"
            value={duration}
            onChange={handleChange}
          />
        </Box>
        {busy && <FunnySpinner />}
        <Box className={classes.buttons} style={{ paddingBottom: "16px" }}>
          <RainbowButton type="submit" text="Lend" disabled={busy} />
        </Box>
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            width: "50%",
            minWidth: "200px",
          }}
        >
          <TextField
            id="standard-basic"
            label="Daily rent price is..."
            disabled
          />
          <TextField
            id="standard-basic"
            label="You will pay xxx upfront for the rent"
            disabled
          />
          <Box>
            You must return the NFT by xxx, or you will lose the collateral xxx
          </Box>
        </Box>
        <Box>Confirm (this triggers the form)</Box>
      </Box>
    </Modal>
  );
};

export default RentModal;
