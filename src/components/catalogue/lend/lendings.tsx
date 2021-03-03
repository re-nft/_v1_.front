import React, { useState, useCallback, useContext } from "react";
import GraphContext from "../../../contexts/Graph";
import { ERCNft } from "../../../contexts/Graph/types";
import { LendModal } from "../modals/lend";
import {
  CurrentAddressContext,
  RentNftContext,
} from "../../../hardhat/SymfoniContext";
import CatalogueItem from "../../catalogue/catalogue-item";

type MinimalNft = {
  contract?: ERCNft["contract"];
  tokenId?: ERCNft["tokenId"];
};

type LendButtonProps = {
  handleLend: (nft: MinimalNft) => void;
  nft: MinimalNft;
};

// todo: add a calculator on how much it will cost our users to lend / rent
// give the ability to put in the entry gaslimit and price as well as exit
// then give the breakdown of the cost

const LendButton: React.FC<LendButtonProps> = ({ handleLend, nft }) => {
  const handleClick = useCallback(() => {
    handleLend(nft);
  }, [handleLend, nft]);
  return (
    <div className="Nft__card">
      <span className="Nft__button" onClick={handleClick}>
        Lend now
      </span>
    </div>
  );
};

const Lendings: React.FC = () => {
  const [selectedNft, setSelectedNft] = useState<MinimalNft>();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentAddress] = useContext(CurrentAddressContext);
  const { instance: renft } = useContext(RentNftContext);
  const { getUsersNfts } = useContext(GraphContext);

  const handleStartLend = useCallback(
    async (nft) => {
      if (!nft.contract || !renft || !currentAddress) return;
      setSelectedNft(nft);
      setModalOpen(true);
    },
    [renft, currentAddress]
  );

  const nfts = getUsersNfts();

  return (
    <>
      <LendModal
        nft={{ contract: selectedNft?.contract, tokenId: selectedNft?.tokenId }}
        open={modalOpen}
        setOpen={setModalOpen}
      />
      {nfts.map((nft) => {
        const nftId = `${nft.address}::${nft.tokenId}`;
        return (
          <CatalogueItem
            key={nftId}
            tokenId={nft.tokenId}
            nftAddress={nft.address}
            mediaURI={nft.meta?.mediaURI ?? ""}
          >
            <div className="Nft__card" style={{ marginTop: "8px" }}>
              <LendButton
                nft={{
                  contract: nft.contract,
                  tokenId: nft.tokenId,
                }}
                handleLend={handleStartLend}
              />
            </div>
          </CatalogueItem>
        );
      })}
    </>
  );
};

export default Lendings;