import React, { useState, useCallback, useContext, useMemo } from "react";
import { Box } from "@material-ui/core";
import * as R from "ramda";

import GraphContext from "../../contexts/Graph";
import { LendModal } from "../LendModal";
import { Nft } from "../../types";
import {
  CurrentAddressContext,
  RentNftContext,
} from "../../hardhat/SymfoniContext";
import CatalogueItem from "../CatalogueItem";

type LendButtonProps = {
  handleLend: (nft: Nft) => void;
  nft: Nft;
};

const DEFAULT_NFT: Nft = {
  tokenId: "",
  image: "",
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
  const [selectedNft, setSelectedNft] = useState<Nft & { isApproved: boolean }>(
    { ...DEFAULT_NFT, isApproved: true }
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [currentAddress] = useContext(CurrentAddressContext);
  const { instance: renft } = useContext(RentNftContext);
  // all of the erc721s and erc1155s that I own
  const { erc721s, erc1155s } = useContext(GraphContext);
  const availableNfts = useMemo(() => {
    const nfts: Nft[] = [];
    if (!erc721s || !erc1155s) return nfts;
    for (const address of Object.keys(erc721s)) {
      if (!erc721s[address]) continue;
      if (!R.hasPath([address, "tokenIds"], erc721s)) continue;
      for (const tokenId of Object.keys(erc721s[address].tokenIds)) {
        let image = R.pathOr(
          "",
          [address, "tokenIds", tokenId, "image"],
          erc721s
        );
        if (image === "") {
          image = R.pathOr(
            "",
            [address, "tokenIds", tokenId, "image_url"],
            erc721s
          );
        }
        nfts.push({
          contract: erc721s[address].contract,
          tokenId,
          image,
        });
      }
    }
    for (const address of Object.keys(erc1155s)) {
      if (!erc1155s[address]) continue;
      if (!R.hasPath([address, "tokenIds"], erc1155s)) continue;
      for (const tokenId of Object.keys(erc1155s[address].tokenIds)) {
        const image = R.pathOr(
          "",
          [address, "tokenIds", tokenId, "image"],
          erc1155s
        );
        nfts.push({ contract: erc1155s[address].contract, tokenId, image });
      }
    }
    return nfts;
  }, [erc721s, erc1155s]);

  const handleStartLend = useCallback(
    async (nft: Nft) => {
      if (!nft.contract || !renft || !currentAddress) return;
      const isApproved = await nft.contract.isApprovedForAll(
        currentAddress,
        renft.address
      );
      setSelectedNft({ ...nft, isApproved });
      setModalOpen(true);
    },
    [renft, currentAddress]
  );

  return (
    <Box>
      <LendModal nft={selectedNft} open={modalOpen} setOpen={setModalOpen} />
      <Box className="Catalogue">
        {availableNfts.map((nft) => {
          const nftId = `${nft.contract?.address ?? ""}::${nft.tokenId}`;
          return (
            <CatalogueItem
              key={nftId}
              tokenId={nft.tokenId}
              nftAddress={nft.contract?.address ?? ""}
              image={nft.image}
            >
              <div className="Nft__card" style={{ marginTop: "8px" }}>
                <LendButton nft={nft} handleLend={handleStartLend} />
              </div>
            </CatalogueItem>
          );
        })}
      </Box>
    </Box>
  );
};

export default AvailableToLend;
