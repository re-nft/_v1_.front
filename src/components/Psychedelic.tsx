import React, {
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  ChangeEvent
} from "react";
import { Box, Modal, Input } from "@material-ui/core";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

// contexts
import DappContext from "../contexts/Dapp";
import GraphContext from "../contexts/Graph";
import ContractsContext from "../contexts/Contracts";

import ScrollForMore from "./ScrollForMore";
import Cold from "./Cold";

import { addresses } from "../contracts";

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

type LendOneInputs = {
  maxDuration: number;
  borrowPrice: number;
  nftPrice: number;
};

const LendModal = ({ faceId, open, setOpen, btnActionLabel }) => {
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

export const Catalogue = ({ data, btnActionLabel }) => {
  const [lendModalOpen, setLendModalOpen] = useState(false);
  // TODO: mumbo-jumbo 2 am - follow the easy path
  const [faceId, setFaceId] = useState();

  const handleClick = useCallback(
    id => {
      if (btnActionLabel === "Lend") {
        setLendModalOpen(true);
      }
      setFaceId(id);
    },
    [btnActionLabel, setLendModalOpen]
  );

  return (
    <>
      <LendModal
        faceId={faceId}
        btnActionLabel={btnActionLabel}
        open={lendModalOpen}
        setOpen={setLendModalOpen}
      />
      <div className="Catalogue">
        {data.length > 0 &&
          data.map(face => {
            return (
              <div className="Catalogue__item" key={face.id}>
                <div
                  className="Product"
                  data-item-id={face.id}
                  data-item-image={face.uri}
                >
                  <div className="Product__image">
                    <img alt="nft" src={face.uri} />
                  </div>
                  <div className="Product__details">
                    <div className="Product__name">
                      {btnActionLabel === "Rent" && (
                        <div className="Product__price">10 €</div>
                      )}
                    </div>
                    <span
                      className="Product__buy"
                      onClick={e => handleClick(face.id)}
                    >
                      {btnActionLabel} now
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
};

type PsychedelicProps = {
  children?: React.ReactNode;
  data?: any;
  hidden: boolean;
  isRent: boolean;
};

type Face = {
  id: string;
  uri: string;
};

const Psychedelic: React.FC<PsychedelicProps> = ({ hidden, isRent }) => {
  const { wallet } = useContext(DappContext);
  const { nfts, user } = useContext(GraphContext);
  const [data, setData] = useState<Face[]>();
  const btnLbl = isRent === true ? "Rent" : "Lend";

  useEffect(() => {
    if (isRent && nfts != null && wallet != null && wallet.account) {
      // * filter step removes YOUR lent NFTs
      const resolvedData = nfts
        .filter(item => item.lender !== wallet.account.toLowerCase())
        .map(item => item.face);
      setData(resolvedData);
      return;
    }
    // lend
    if (user == null) {
      console.debug("no user data yet");
      return;
    }
    const currentLending = user.lending.map(item => item.id);
    // TODO: O(N**2) time complexity is shit
    const resolvedData = user.faces.filter(
      item => !currentLending.includes(item.id)
    );
    setData(resolvedData);
  }, [nfts, user]);

  const isValid = data => {
    return data != null && data.length > 0;
  };

  const dataIsValid = useMemo(() => {
    return isValid(data);
  }, [data]);

  return (
    !hidden && (
      <Box>
        {dataIsValid && (
          <Box>
            <ScrollForMore />
            <Catalogue data={data} btnActionLabel={btnLbl} />
          </Box>
        )}
        {!dataIsValid && <Cold fancyText="One day it will be warm here..." />}
      </Box>
    )
  );
};

export default Psychedelic;
