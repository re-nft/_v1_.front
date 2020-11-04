import React, { useCallback, useState, useContext } from "react";
import { withStyles } from "@material-ui/core/styles";
import { TextField } from "@material-ui/core";
import * as R from "ramda";

// contexts
import ContractsContext from "../contexts/Contracts";
import RetroModal from "./RetroModal";
import FunnySpinner from "./Spinner";

const CssTextField = withStyles({
  root: {
    background: "#dadad3",
    color: "black",
    // "& label": {
    //   color: "black",
    // },
    // "& input": {
    //   color: "black",
    // },
    // "& label.Mui-focused": {
    //   color: "black",
    // },
    // "& .MuiInput-underline:after": {
    //   borderBottomColor: "black",
    // },
    // "& .MuiOutlinedInput-root": {
    //   "& fieldset": {
    //     borderColor: "black",
    //   },
    // },
    "&:hover fieldset": {
      borderColor: "black",
    },
    "&.Mui-focused fieldset": {
      borderColor: "black",
    },
    // },
  },
})(TextField);

type RentModalProps = {
  faceId: string;
  open: boolean;
  handleClose: () => void;
};

const RentModal: React.FC<RentModalProps> = ({ faceId, open, handleClose }) => {
  const { rent, pmtToken } = useContext(ContractsContext);
  const [duration, setDuration] = useState<number>(1);
  const [busy, setIsBusy] = useState(false);
  const [inputsValid, setInputsValid] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();
    let resolved = 1;
    try {
      resolved = Number(e.target.value);
      setInputsValid(true);
    } catch (err) {
      setInputsValid(false);
      console.debug("could not convert rent duration to number");
    }
    setDuration(resolved);
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
    <RetroModal
      handleSubmit={handleSubmit}
      title="RENT"
      buttonTitle="RENT"
      open={open}
      handleClose={handleClose}
    >
      {busy && <FunnySpinner />}
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
    </RetroModal>
  );
};

export default RentModal;
