import React, { useCallback, useState, useContext } from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { TextField, Box, withStyles } from "@material-ui/core";
import RainbowButton from "../../forms/rainbow-button";
import CssTextField from "../../forms/css-text-field";
import Modal from "./modal";
import { Lending } from "../../../contexts/graph/classes";

// const SENSIBLE_MAX_DURATION = 10 * 365;

const useStyles = makeStyles(() =>
  createStyles({
    inputs: {
      display: "flex",
      flexDirection: "column",
      // matches direct div children of inputs
      "& > div": {
        marginBottom: "12px",
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
  nft: Lending[];
  onSubmit(nft: Lending[], options: { rentDuration: string[] }): void;
};

// const DEFAULT_ERROR_TEXT = "Must be a natural number e.g. 1, 2, 3";

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

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.name;
      const value = e.target.value;
      const lendingItem = nft.find(x => x.tokenId === name);
      setDuration({
        ...duration,
        [name]: value,
      });
      setTotalRent({
        ...totalRent,
        // @ts-ignore
        [name]: Number(lendingItem?.lending.nftPrice + lendingItem?.lending.dailyRentPrice * value),
      })
    },
    [duration, setDuration, totalRent, setTotalRent]
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
        <Box style={{ padding: "32px", width: '500px' }}>
          <Box className={classes.inputs}>
            {nft.map((item: Lending) => {
              return (
                <div className="form-section" key={item.tokenId}>
                  <Box className={classes.inputs}>
                    <div className="legend-field">
                      <LegibleTextField
                        label={`TokenId: ${item.tokenId}`}
                        disabled
                      />
                    </div>
                    <CssTextField
                      required
                      label={`Rent duration (max duration ${item.lending.maxRentDuration} days)`}
                      id={`${item.tokenId}::duration`}
                      variant="outlined"
                      type="number"
                      name={item.tokenId}
                      value={duration[item.tokenId]}
                      error={!inputsValid[item.tokenId]}
                      onChange={handleChange}
                    />
                    <LegibleTextField
                      label={`Daily rent price: ${item.lending.dailyRentPrice}`}
                      disabled
                    />
                    {
                      <LegibleTextField
                        label={`Rent: ${item.lending.dailyRentPrice} x ${
                          !duration[item.tokenId] ? "👾" : duration[item.tokenId]
                        } days + ${item.lending.nftPrice} = ${
                          totalRent[item.tokenId]
                            ? totalRent[item.tokenId].toFixed(2)
                            : "👾"
                        }`}
                        disabled
                      />
                    }
                    <LegibleTextField
                      label={`Collateral: ${item.lending.nftPrice}`}
                      disabled
                    />
                    <Box
                      className={classes.buttons}
                      style={{ paddingBottom: "16px" }}
                    ></Box>
                    {/*<Box>
                      <p>
                        You <span style={{ fontWeight: "bold" }}>must</span>{" "}
                        return the NFT {item.tokenId} by , or you{" "}
                        <span style={{ fontWeight: "bold" }}>will lose</span> the
                        collateral
                      </p>
                    </Box>*/}
                  </Box>
                </div>
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
