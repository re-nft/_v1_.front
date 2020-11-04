import React, { useCallback, useContext } from "react";
import { Box } from "@material-ui/core";
import * as R from "ramda";

// contexts
import DappContext from "../contexts/Dapp";
import ContractsContext from "../contexts/Contracts";

// import RentModal from "./RentModal";
import { Nft } from "../types";

type RentCatalogueProps = {
  data?: Nft[];
  iBorrow: boolean;
};

type RentButtonProps = {
  handleRent: (id: string) => Promise<void>;
  id: string;
  iBorrow: boolean;
};

type NumericFieldProps = {
  text: string;
  value: string;
};

const NumericField: React.FC<NumericFieldProps> = ({ text, value }) => (
  <div className="Product__details">
    <p className="Product__text_overflow">
      <span className="Product__label">{text}</span>
      <span className="Product__value">{`${value} fDAI`}</span>
    </p>
  </div>
);

const RentButton: React.FC<RentButtonProps> = ({ handleRent, id, iBorrow }) => {
  const handleClick = useCallback(() => {
    handleRent(id);
  }, [handleRent, id]);

  return (
    <span className="Product__buy" onClick={handleClick}>
      {iBorrow ? "Return" : "Rent"} now
    </span>
  );
};

const RentCatalogue: React.FC<RentCatalogueProps> = ({ data, iBorrow }) => {
  // const [modalOpen, setModalOpen] = useState(false);
  // const [faceId, setFaceId] = useState<string>();
  const { web3 } = useContext(DappContext);
  const { rent, pmtToken } = useContext(ContractsContext);

  const handleRent = useCallback(
    async (faceId: string) => {
      // setFaceId(tokenId);
      const tokenId = faceId.split("::")[1];

      if (!rent || !pmtToken || !R.hasPath(["dai", "approve"], pmtToken)) {
        console.debug("rent or pmtToken or approve not available");
        return;
      }

      // TODO: approve conditional (only approve if not approved before)
      await pmtToken.dai.approve();
      // TODO: set the rent duration in the front-end modal
      await rent.rentOne(tokenId, "1");
    },
    [rent, pmtToken]
  );

  const fromWei = (v?: number): string =>
    v && web3 ? web3?.utils.fromWei(String(v), "ether") : "";

  return (
    <Box>
      {/* <RentModal
        faceId={faceId}
        open={lendModalOpen}
        setOpen={setLendModalOpen}
      /> */}
      <Box className="Catalogue">
        {data &&
          data.length > 0 &&
          data.map((nft) => {
            return (
              <div className="Catalogue__item" key={nft.id}>
                <div
                  className="Product"
                  data-item-id={nft.id}
                  data-item-image={nft.face.uri}
                >
                  <div className="Product__image">
                    <a href={nft.face.uri}>
                      <img alt="nft" src={nft.face.uri} />
                    </a>
                  </div>
                  <div className="Product__details">
                    <p className="Product__text_overflow">
                      <a
                        href={`https://goerli.etherscan.io/address/${nft.address}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "none", color: "black" }}
                      >
                        {nft.address}
                      </a>
                    </p>
                  </div>
                  <div className="Product__details">
                    <p className="Product__text_overflow">
                      <span className="Product__label">Token id</span>
                      <span className="Product__value">
                        {nft.id.split("::")[1]}
                      </span>
                    </p>
                  </div>
                  <NumericField
                    text="Daily price"
                    value={fromWei(nft.borrowPrice)}
                  />
                  <NumericField
                    text="Max duration"
                    value={fromWei(nft.maxDuration)}
                  />
                  <NumericField
                    text="Collateral"
                    value={fromWei(nft.nftPrice)}
                  />
                  <div className="Product__details">
                    <RentButton
                      handleRent={handleRent}
                      id={nft.face.id}
                      iBorrow={iBorrow}
                    />
                  </div>
                </div>
              </div>
            );
          })}
      </Box>
    </Box>
  );
};

export default RentCatalogue;
