import React, { useCallback, useState } from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { TextField, Box, withStyles } from "@material-ui/core";

import RainbowButton from "../../rainbow-button";
import CssTextField from "../../css-text-field";
import Modal from "../../modal";
import { ERCNft } from "../../../contexts/graph/types";

// const SENSIBLE_MAX_DURATION = 10 * 365;

const useStyles = makeStyles(() =>
  createStyles({
    inputs: {
      display: "flex",
      flexDirection: "column",
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

type BatchRentModalProps = {
  open: boolean;
  handleClose: () => void;
  nft: ERCNft[];
  onSubmit(nft: ERCNft[], options: { rentDuration: string[] }): void;
};

const DEFAULT_ERROR_TEXT = "Must be a natural number e.g. 1, 2, 3";

export const BatchRentModal: React.FC<BatchRentModalProps> = ({
  open,
  handleClose,
  nft,
  onSubmit,
}) => {
  const classes = useStyles();
  const [duration, setDuration] = useState<Record<string, string>>({});
  const [totalRent, setTotalRent] = useState<Record<string, number>>({});
  const [inputsValid, setInputsValid] = useState<Record<string, boolean>>({});
  const [errorText, setErrorText] = useState<Record<string, string>>({});
  const [returnDate, setReturnDate] = useState<Record<string, string>>({});
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.name;
      const value = e.target.value;
      setDuration({
        ...duration,
        [name]: value,
      });
    },
    [duration, setDuration]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const rentDuration = Object.values(duration);
      onSubmit(nft, { rentDuration });
      handleClose();
    },
    [nft, duration, handleClose, onSubmit]
  );

  return (
    <Modal open={open} handleClose={handleClose}>
      <form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Box style={{ padding: "32px" }}>
          <Box className={classes.inputs}>
            {nft.map((item: ERCNft) => {
              return (
                <Box key={item.tokenId} className={classes.inputs}>
                  <LegibleTextField
                    id="standard-basic"
                    label={`TokenId: ${item.tokenId}`}
                    disabled
                  />
                  <CssTextField
                    required
                    label="Rent duration"
                    id="duration"
                    variant="outlined"
                    type="number"
                    name={item.tokenId}
                    value={duration[item.tokenId]}
                    error={!inputsValid[item.tokenId]}
                    onChange={handleChange}
                  />
                  <LegibleTextField
                    id="standard-basic"
                    label={`Daily rent price: ${0}`}
                    disabled
                  />
                  {
                    <LegibleTextField
                      id="standard-basic"
                      label={`Rent: ${0} x ${
                        !duration[item.tokenId] ? "👾" : duration[item.tokenId]
                      } days = ${
                        totalRent[item.tokenId]
                          ? totalRent[item.tokenId].toFixed(2)
                          : "e ^ (i * π) + 1"
                      }`}
                      disabled
                    />
                  }
                  <LegibleTextField
                    id="standard-basic"
                    label={`Collateral: ${0}`}
                    disabled
                  />
                  <Box
                    className={classes.buttons}
                    style={{ paddingBottom: "16px" }}
                  ></Box>
                  <Box>
                    <p>
                      You <span style={{ fontWeight: "bold" }}>must</span>{" "}
                      return the NFT {item.tokenId} by , or you{" "}
                      <span style={{ fontWeight: "bold" }}>will lose</span> the
                      collateral
                    </p>
                  </Box>
                </Box>
              );
            })}
          </Box>
          <Box className={classes.buttons}>
            <RainbowButton type="submit" text="RENT ALL" disabled={false} />
          </Box>
        </Box>
      </form>
    </Modal>
  );
};

export default BatchRentModal;
