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
};

type RentButtonProps = {
  handleRent: (id: string) => Promise<void>;
  id: string;
};

const RentButton: React.FC<RentButtonProps> = ({ handleRent, id }) => {
  const handleClick = useCallback(() => {
    handleRent(id);
  }, [handleRent, id]);

  return (
    <span className="Product__buy" onClick={handleClick}>
      Rent now
    </span>
  );
};

const RentCatalogue: React.FC<RentCatalogueProps> = ({ data }) => {
  // const [modalOpen, setModalOpen] = useState(false);
  // const [faceId, setFaceId] = useState<string>();
  const { web3 } = useContext(DappContext);
  const { rent, pmtToken } = useContext(ContractsContext);

  const handleRent = useCallback(
    async (tokenId: string) => {
      // setFaceId(tokenId);

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
                      <span className="Product__label">Daily price</span>
                      <span className="Product__value">
                        {`${fromWei(nft.borrowPrice)} fDAI`}
                      </span>
                    </p>
                  </div>
                  <div className="Product__details">
                    <p className="Product__text_overflow">
                      <span className="Product__label">Max duration</span>{" "}
                      <span className="Product__value">{`${fromWei(
                        nft.maxDuration
                      )} days`}</span>
                    </p>
                  </div>
                  <div className="Product__details">
                    <p className="Product__text_overflow">
                      <span className="Product__label">Collateral</span>
                      <span className="Product__value">
                        {`${fromWei(nft.nftPrice)} fDAI`}
                      </span>
                    </p>
                  </div>
                  <div className="Product__details">
                    <RentButton handleRent={handleRent} id={nft.face.id} />
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
