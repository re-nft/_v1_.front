import React, { useState, useCallback, useContext } from "react";
import GraphContext from "../../../contexts/graph";
import { Nft } from "../../../contexts/graph/classes";
import { LendModal } from "../modals/lend";
import {
  CurrentAddressContext,
  RentNftContext,
} from "../../../hardhat/SymfoniContext";
import CatalogueItem from "../../catalogue/catalogue-item";
import ActionButton from "../../forms/action-button";
import CatalogueLoader from "../catalogue-loader";

const Lendings: React.FC = () => {
  const [selectedNft, setSelectedNft] = useState<Nft>();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentAddress] = useContext(CurrentAddressContext);
  const { instance: renft } = useContext(RentNftContext);
  const { usersNfts } = useContext(GraphContext);
  const handleClose = useCallback(() => setModalOpen(false), [setModalOpen]);
  const handleStartLend = useCallback(
    async (nft) => {
      if (!nft.contract || !renft || !currentAddress) return;
      setSelectedNft(nft);
      setModalOpen(true);
    },
    [renft, currentAddress]
  );

  if (usersNfts.length === 0) {
    return <CatalogueLoader />;
  }

  return (
    <>
      {selectedNft && (
        <LendModal nft={selectedNft} open={modalOpen} onClose={handleClose} />
      )}
      {usersNfts.map((nft) => {
        return (
          <CatalogueItem key={`${nft.address}::${nft.tokenId}`} nft={nft}>
            <ActionButton
              nft={nft}
              title="Lend now"
              onClick={handleStartLend}
            />
          </CatalogueItem>
        );
      })}
    </>
  );
};

export default Lendings;
