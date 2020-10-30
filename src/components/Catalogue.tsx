import React, { useState, useCallback, useContext } from "react";

import LendModal from "./LendModal";

import { Face, Nft } from "../types";
import DappContext from "../contexts/Dapp";

type CatalogueProps = {
  data?: Face[] | Nft[];
  btnActionLabel: "Rent" | "Lend";
};

const Catalogue: React.FC<CatalogueProps> = ({ data, btnActionLabel }) => {
  const [lendModalOpen, setLendModalOpen] = useState(false);
  // TODO: mumbo-jumbo 2 am - follow the easy path
  const [faceId, setFaceId] = useState<string>();
  const { web3 } = useContext(DappContext);

  const handleClick = useCallback(
    (id) => {
      if (btnActionLabel === "Lend") {
        setLendModalOpen(true);
      }
      setFaceId(id);
    },
    [btnActionLabel, setLendModalOpen]
  );

  const fromWei = (v?: number): string =>
    v && web3 ? web3?.utils.fromWei(String(v), "ether") : "";

  // type guard
  const dataIsRent = (_data: CatalogueProps["data"]): _data is Nft[] => {
    if (_data == null) {
      return false;
    }

    const firstItem = _data[0];

    // TODO: something like this in the future
    // Object.keys(firstItem).forEach(key => {
    //   if (!(key in Nft)) {
    //     isNft = false;
    //   }
    // });

    if ("face" in firstItem) {
      return true;
    }
    return false;
  };

  // const isRent = btnActionLabel === "Rent";

  // TODO: refactor
  return (
    <>
      {faceId && (
        <LendModal
          faceId={faceId}
          btnActionLabel={btnActionLabel}
          open={lendModalOpen}
          setOpen={setLendModalOpen}
        />
      )}
      <div className="Catalogue">
        {data &&
          data.length > 0 &&
          !dataIsRent(data) &&
          data.map((face) => {
            return (
              <div className="Catalogue__item" key={face.id}>
                <div
                  className="Product"
                  data-item-id={face.id}
                  data-item-image={face.uri}
                >
                  <div className="Product__image">
                    <a href={face.uri}>
                      <img alt="nft" src={face.uri} />
                    </a>
                  </div>
                  <div className="Product__details">
                    <span
                      className="Product__buy"
                      onClick={() => handleClick(face.id)}
                    >
                      Lend now
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        {data &&
          data.length > 0 &&
          dataIsRent(data) &&
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
                    <span
                      className="Product__buy"
                      onClick={() => handleClick(nft.face.id)}
                    >
                      Rent now
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

export default Catalogue;
