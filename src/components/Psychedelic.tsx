import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo
} from "react";
import { request } from "graphql-request";
import Modal from "@material-ui/core/Modal";
import { Input } from "@material-ui/core";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

// contexts
import DappContext from "../contexts/Dapp";
import ContractsContext from "../contexts/Contracts";

import ScrollForMore from "../components/ScrollForMore";
import { ENDPOINT, nftsQuery, userQuery } from "../api/graph";
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

const LendModal = ({ faceId, open, setOpen, btnActionLabel }) => {
  const { web3, wallet } = useContext(DappContext);
  const { rent, face, approveOfAllFaces } = useContext(ContractsContext);

  const classes = useStyles();
  const [maxDuration, setMaxDuration] = useState("1");
  const [borrowPrice, setBorrowPrice] = useState("5");
  const [nftPrice, setNftPrice] = useState("100");

  // TODO: one handler to rule them all
  const handleMaxDuration = useCallback(
    event => {
      setMaxDuration(event.target.value);
    },
    [setMaxDuration]
  );
  const handleBorrowPrice = useCallback(
    event => {
      setBorrowPrice(event.target.value);
    },
    [setBorrowPrice]
  );
  const handleNftPrice = useCallback(
    event => {
      setNftPrice(event.target.value);
    },
    [setNftPrice]
  );

  const handleAction = useCallback(async () => {
    if (maxDuration == null || borrowPrice == null || nftPrice == null) {
      console.debug("must set lending related fields first");
      return;
    }
    if (web3 == null || wallet == null || !wallet.account) {
      console.debug("connect to goerli network");
      return;
    }
    if (rent == null || face == null) {
      console.debug("contracts are not ready yet");
      return;
    }

    if (btnActionLabel === "Lend") {
      await rent.methods
        .lendOne(
          addresses.goerli.face,
          faceId,
          maxDuration,
          borrowPrice,
          nftPrice
        )
        .send({ from: wallet.account });
    } else {
      // rent
    }
  }, [web3, rent, wallet.account, btnActionLabel, faceId, face]);

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
            value={maxDuration}
            type="number"
            onChange={handleMaxDuration}
            placeholder="1"
            name="maxDuration"
          />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <p>Borrow price</p>
          <Input
            style={{ color: "white" }}
            value={borrowPrice}
            type="number"
            onChange={handleBorrowPrice}
            placeholder="5"
            name="borrowPrice"
          />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <p>Collateral</p>
          <Input
            style={{ color: "white" }}
            value={nftPrice}
            type="number"
            onChange={handleNftPrice}
            placeholder="50"
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
          onClick={approveOfAllFaces}
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
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  // TODO: mumbo-jumbo 2 am - follow the easy path
  const [faceId, setFaceId] = useState();

  // TODO: crazzey
  const resolved = useMemo(() => {
    if (btnActionLabel === "Lend") {
      return data.user.faces;
    } else {
      return data;
    }
  }, [data, btnActionLabel]);

  const handleClick = useCallback(
    id => {
      if (btnActionLabel === "Lend") {
        setLendModalOpen(true);
      } else {
        setBorrowModalOpen(true);
      }
      setFaceId(id);
    },
    [btnActionLabel, setLendModalOpen, setBorrowModalOpen]
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
        {resolved.length > 0 &&
          resolved.map(face => {
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
                    {/* TODO: yikes at re-generating the handler */}
                    <span
                      className="Product__buy"
                      onClick={() => handleClick(face.id)}
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

const Psychedelic: React.FC<PsychedelicProps> = ({
  children,
  hidden,
  isRent
}) => {
  const [data, setData] = useState();
  const { wallet, web3 } = useContext(DappContext);

  // TODO: move to graph  context
  const fetchNfts = useCallback(async () => {
    if (isRent) {
      const data = await request(ENDPOINT, nftsQuery());
      if ("nfts" in data && data["nfts"].length !== 0) {
        setData(data["nfts"].map(nft => nft.face));
      }
    } else {
      // lend. so pull all the nfts that you own
      if (wallet.account == null || web3 == null) {
        console.debug("connect to goerli network");
        return;
      }
      const userNftsQuery = userQuery(wallet.account, web3);
      const data = await request(ENDPOINT, userNftsQuery);
      setData(data);
    }
  }, [wallet.account, web3]);

  useEffect(() => {
    fetchNfts();
  }, [wallet.account, web3]);

  const btnActionLabel = isRent ? "Rent" : "Lend";

  return (
    !hidden && (
      <>
        {data != null && <ScrollForMore />}
        {data && <Catalogue data={data} btnActionLabel={btnActionLabel} />}
        {children && data == null && children}
      </>
    )
  );
};

export default Psychedelic;
