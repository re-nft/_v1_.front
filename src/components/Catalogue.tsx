import React, { useState, useCallback } from "react";

import LendModal from "./LendModal";

import { Face, Nft } from "../types";
import { short } from "../utils";

type CatalogueProps = {
  data: Face[] | Nft[];
  btnActionLabel: "Rent" | "Lend";
};

const Catalogue: React.FC<CatalogueProps> = ({ data, btnActionLabel }) => {
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

  // type guard
  const dataIsRent = (_data: CatalogueProps["data"]): _data is Nft[] => {
    const firstItem = data[0];

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
      <LendModal
        faceId={faceId}
        btnActionLabel={btnActionLabel}
        open={lendModalOpen}
        setOpen={setLendModalOpen}
      />
      <div className="Catalogue">
        {data.length > 0 &&
          !dataIsRent(data) &&
          data.map(face => {
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
                      onClick={e => handleClick(face.id)}
                    >
                      Lend now
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        {data.length > 0 &&
          dataIsRent(data) &&
          data.map(nft => {
            console.log(nft)
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
                    <div className="Product__name">{short(nft.address)}</div>
                    <div className="Product__price">{nft.borrowPrice} fDAI</div>
                  </div>
                  <div className="Product__details">
                  <div className="Product__name">Max duration</div>
                  <div className="Product__price">{nft.maxDuration} fDAI</div>
                    </div>
                    <div className="Product__details">
                      <div className="Product__name">Collateral</div>
            <div className="Product__price">{nft.nftPrice} fDAI</div>
                      </div>
                  <div className="Product__details">
                  <span
                      className="Product__buy"
                      onClick={e => handleClick(nft.face.id)}
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
