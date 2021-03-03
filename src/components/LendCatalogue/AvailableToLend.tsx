import React, { useState, useCallback, useContext } from "react";
import { Box } from "@material-ui/core";

import GraphContext from "../../contexts/Graph";
import { ERCNft } from "../../contexts/Graph/types";
import { LendModal } from "../LendModal";
import {
  CurrentAddressContext,
  RentNftContext,
} from "../../hardhat/SymfoniContext";
import CatalogueItem from "../CatalogueItem";

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

export const AvailableToLend: React.FC = () => {
  const [selectedNft, setSelectedNft] = useState<MinimalNft>();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentAddress] = useContext(CurrentAddressContext);
  const { instance: renft } = useContext(RentNftContext);
  const { nfts } = useContext(GraphContext);

  const handleStartLend = useCallback(
    async (nft) => {
      if (!nft.contract || !renft || !currentAddress) return;
      setSelectedNft(nft);
      setModalOpen(true);
    },
    [renft, currentAddress]
  );

  return (
    <Box>
      <LendModal
        nft={{ contract: selectedNft?.contract, tokenId: selectedNft?.tokenId }}
        open={modalOpen}
        setOpen={setModalOpen}
      />
      <Box className="Catalogue">
        {Object.keys(nfts).map((nftAddress) => {
          Object.keys(nfts[nftAddress]).map((tokenId) => {
            const nftId = `${nftAddress}::${tokenId}`;
            return (
              <CatalogueItem
                key={nftId}
                tokenId={tokenId}
                nftAddress={nftAddress}
                image={nfts[nftAddress].tokens[tokenId]?.meta?.mediaURI}
              >
                <div className="Nft__card" style={{ marginTop: "8px" }}>
                  <LendButton
                    nft={{
                      contract: nfts[nftAddress].contract,
                      tokenId,
                    }}
                    handleLend={handleStartLend}
                  />
                </div>
              </CatalogueItem>
            );
          });
        })}
      </Box>
    </Box>
  );
};

export default AvailableToLend;
