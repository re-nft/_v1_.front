import React, { useState, useCallback, useContext, useEffect } from "react";
import GraphContext from "../../../contexts/graph";
import { Nft } from "../../../contexts/graph/classes";
import { LendModal } from "../modals/lend";
import {
  CurrentAddressContext,
  RentNftContext,
} from "../../../hardhat/SymfoniContext";
import CatalogueItem from "../../catalogue/catalogue-item";
import ActionButton from "../../action-button";

const Lendings: React.FC = () => {
  const [selectedNft, setSelectedNft] = useState<Nft>();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentAddress] = useContext(CurrentAddressContext);
  const { instance: renft } = useContext(RentNftContext);
  const { usersNfts } = useContext(GraphContext);
  const handleStartLend = useCallback(
    async (nft) => {
      if (!nft.contract || !renft || !currentAddress) return;
      setSelectedNft(nft);
      setModalOpen(true);
    },
    [renft, currentAddress]
  );

  if (!selectedNft) return <></>;

  return (
    <>
      <LendModal nft={selectedNft} open={modalOpen} setOpen={setModalOpen} />
      {usersNfts.map(async (nft) => {
        const mediaURI = await nft.mediaURI();
        <CatalogueItem
          key={`${nft.address}::${nft.tokenId}`}
          tokenId={nft.tokenId}
          nftAddress={nft.address}
          mediaURI={mediaURI ?? ""}
        >
          <div className="Nft__card" style={{ marginTop: "8px" }}>
            <ActionButton
              nft={nft}
              title="Lend now"
              onClick={handleStartLend}
            />
          </div>
        </CatalogueItem>;
      })}
    </>
  );
};

export default Lendings;
