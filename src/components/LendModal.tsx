import React, { useContext, useState, useCallback, ChangeEvent } from "react";
import { Modal, Input } from "@material-ui/core";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

// contexts
import DappContext from "../contexts/Dapp";
import ContractsContext from "../contexts/Contracts";

type LendOneInputs = {
  maxDuration: number;
  borrowPrice: number;
  nftPrice: number;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    swanky: {
      flex: "0",
      width: 600,
      height: 430,
      backgroundColor: "#663399",
      margin: "auto",
      border: "3px solid #000",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
      color: "white",
      textAlign: "center"
    }
  })
);

export default ({ faceId, open, setOpen, btnActionLabel }) => {
  const classes = useStyles();

  const { web3, wallet } = useContext(DappContext);
  const { rent, face } = useContext(ContractsContext);

  const [lendOneInputs, setLendOneInputs] = useState<LendOneInputs>({
    maxDuration: 7,
    borrowPrice: 10,
    nftPrice: 100
  });

  const handleAction = useCallback(async () => {
    if (btnActionLabel === "Lend") {
      await rent.lendOne(
        faceId,
        lendOneInputs.maxDuration,
        lendOneInputs.borrowPrice,
        lendOneInputs.nftPrice
      );
    } else {
      // rent
    }
  }, [web3, rent, wallet.account, btnActionLabel, faceId, face]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setLendOneInputs({ ...lendOneInputs, [e.target.name]: e.target.value });

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      className={classes.swanky}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignContent: "center",
          margin: "auto"
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <p>Max lend duration</p>
          <Input
            style={{ color: "white" }}
            value={lendOneInputs.maxDuration}
            type="number"
            onChange={handleChange}
            name="maxDuration"
          />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <p>Borrow price</p>
          <Input
            style={{ color: "white" }}
            value={lendOneInputs.borrowPrice}
            type="number"
            onChange={handleChange}
            name="borrowPrice"
          />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <p>Collateral</p>
          <Input
            style={{ color: "white" }}
            value={lendOneInputs.nftPrice}
            type="number"
            onChange={handleChange}
            name="nftPrice"
          />
        </div>
        <p style={{ marginTop: "32px", marginBottom: "16px" }}>
          Only use approve all, if you have not used it before
        </p>
        <button
          style={{
            width: "150px",
            marginBottom: "16px",
            marginLeft: "auto",
            marginRight: "auto"
          }}
          className="Product__button"
          onClick={face.approveOfAllFaces}
        >
          Approve all
        </button>
        <button
          style={{ width: "150px", marginLeft: "auto", marginRight: "auto" }}
          className="Product__button"
          onClick={handleAction}
        >
          Lend
        </button>
      </div>
    </Modal>
  );
};
