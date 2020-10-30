import React, { useContext, useState } from "react";
import { Modal, TextField } from "@material-ui/core";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

// contexts
import ContractsContext from "../contexts/Contracts";
import DappContext from "../contexts/Dapp";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    swanky: {
      flex: "0",
      width: 600,
      height: 500,
      backgroundColor: "#663399",
      margin: "auto",
      border: "3px solid #000",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
      color: "white",
      textAlign: "center",
    },
  })
);

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
  btnActionLabel: string;
};

const LendModal: React.FC<LendModalProps> = ({
  faceId,
  open,
  setOpen,
  btnActionLabel,
}) => {
  const classes = useStyles();

  const { rent, face } = useContext(ContractsContext);
  const { web3 } = useContext(DappContext);

  const [lendOneInputs, setLendOneInputs] = useState<LendOneInputs>({
    maxDuration: "7",
    borrowPrice: "10",
    nftPrice: "100",
  });

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (btnActionLabel === "Lend") {
      if (web3 == null) {
        return;
      }
      await rent.lendOne(
        Number(faceId),
        // ! careful. will fail if the stablecoin / ERC20 is not 18 decimals
        web3.utils.toWei(lendOneInputs.maxDuration, "ether"),
        web3.utils.toWei(lendOneInputs.borrowPrice, "ether"),
        web3.utils.toWei(lendOneInputs.nftPrice, "ether")
      );
    } else {
      // rent
    }
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

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      className={classes.swanky}
    >
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignContent: "center",
          margin: "auto",
        }}
        noValidate
        autoComplete="off"
        onSubmit={handleAction}
      >
        <TextField
          required
          error={!isValid(lendOneInputs.maxDuration, lendOneInput.maxDuration)}
          label="Max lend duration"
          id="maxDuration"
          variant="outlined"
          style={{ color: "white", marginBottom: "16px" }}
          value={lendOneInputs.maxDuration}
          type="number"
          helperText={
            !isValid(lendOneInputs.maxDuration, lendOneInput.maxDuration)
              ? "Must be a natural number"
              : ""
          }
          onChange={handleChange}
          name="maxDuration"
        />
        <TextField
          required
          error={!isValid(lendOneInputs.borrowPrice, lendOneInput.borrowPrice)}
          label="Borrow Price"
          id="borrowPrice"
          variant="outlined"
          style={{ color: "white", marginBottom: "16px" }}
          value={lendOneInputs.borrowPrice}
          type="number"
          helperText={
            !isValid(lendOneInputs.borrowPrice, lendOneInput.borrowPrice)
              ? "Must be a zero or a positive decimal"
              : ""
          }
          onChange={handleChange}
          name="borrowPrice"
        />
        <TextField
          required
          error={!isValid(lendOneInputs.nftPrice, lendOneInput.nftPrice)}
          label="Collateral"
          id="nftPrice"
          variant="outlined"
          style={{ color: "white", marginBottom: "16px" }}
          value={lendOneInputs.nftPrice}
          type="number"
          helperText={
            !isValid(lendOneInputs.nftPrice, lendOneInput.nftPrice)
              ? "Must be a zero or a positive decimal"
              : ""
          }
          onChange={handleChange}
          name="nftPrice"
        />
        <p style={{ marginTop: "32px", marginBottom: "16px" }}>
          Only use approve all, if you have not used it before
        </p>
        <div
          role="button"
          style={{
            width: "150px",
            marginBottom: "16px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
          className="Product__button"
          onClick={face.approveOfAllFaces}
        >
          Approve all
        </div>
        <button
          style={{ width: "150px", marginLeft: "auto", marginRight: "auto" }}
          className="Product__button"
          type="submit"
        >
          Lend
        </button>
      </form>
    </Modal>
  );
};

export default LendModal;
