import React, { useState, useCallback, useContext, useEffect } from "react";
import GraphContext from "../../../contexts/Graph";
import { ERCNft } from "../../../contexts/Graph/types";
import { LendModal } from "../modals/lend";
import {
  CurrentAddressContext,
  RentNftContext,
} from "../../../hardhat/SymfoniContext";
import CatalogueItem from "../../catalogue/catalogue-item";
import ActionButton from "../../action-button";

type MinimalNft = {
  contract?: ERCNft["contract"];
  tokenId?: ERCNft["tokenId"];
};

const Lendings: React.FC = () => {
  const [selectedNft, setSelectedNft] = useState<MinimalNft>();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentAddress] = useContext(CurrentAddressContext);
  const { instance: renft } = useContext(RentNftContext);
  const { getUsersNfts } = useContext(GraphContext);
  const [usersNfts, setUsersNfts] = useState<ERCNft[]>([]);
  const handleStartLend = useCallback(
    async (nft) => {
      if (!nft.contract || !renft || !currentAddress) return;
      setSelectedNft(nft);
      setModalOpen(true);
    },
    [renft, currentAddress]
  );

  useEffect(() => {
    getUsersNfts()
      .then((data) => {
        setUsersNfts(data);
      })
      .catch(() => []);
  }, [getUsersNfts]);

  return (
    <>
      <LendModal
        nft={{ contract: selectedNft?.contract, tokenId: selectedNft?.tokenId }}
        open={modalOpen}
        setOpen={setModalOpen}
      />
      {usersNfts.map((nft) => (
        <CatalogueItem
          key={`${nft.address}::${nft.tokenId}`}
          tokenId={nft.tokenId}
          nftAddress={nft.address}
          mediaURI={nft.meta?.mediaURI ?? ""}
        >
          <div className="Nft__card" style={{ marginTop: "8px" }}>
            <ActionButton
              nft={{
                contract: nft.contract,
                tokenId: nft.tokenId,
              }}
              title="Lend now"
              onClick={handleStartLend}
            />
          </div>
        </CatalogueItem>
      ))}
    </>
  );
};

export default Lendings;
