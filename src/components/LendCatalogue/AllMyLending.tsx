import React, { useContext, useCallback } from "react";
import { Box } from "@material-ui/core";

import { RentNftContext } from "../../hardhat/SymfoniContext";
import GraphContext from "../../contexts/Graph";
import { Nft } from "../../contexts/Graph/types";
import { TransactionStateContext } from "../../contexts/TransactionState";
import { useRenft } from "../../hooks/useRenft";
import CatalogueItem from "../CatalogueItem";

// todo: this type is also defined in useRenft hook
type StopLendButtonProps = {
  nft: Nft & { lendingId: string };
};

// todo: handleStopLend multiple as well
const StopLendButton: React.FC<StopLendButtonProps> = ({ nft }) => {
  const { instance: renft } = useContext(RentNftContext);
  const { setHash } = useContext(TransactionStateContext);
  const { removeLending } = useContext(GraphContext);

  const handleStopLend = useCallback(async () => {
    if (!renft || !nft.contract) return;
    // todo: will only work if noone else is renting this
    // todo: need to check if someone else is renting this
    // todo: also make a green outline or something, to show
    // that it is being rented by someone
    // todo: another point: if someone is renting we also need
    // to show the button: "Claim Collateral" in place of Stop Lending
    // This button will be active ONLY if the renter exceeded their
    // rent duration (that they choose in the modal in the Rent tab)
    const tx = await renft.stopLending(
      [nft.contract.address],
      [nft.tokenId],
      [nft.lendingId]
    );
    const isSuccess = await setHash(tx.hash);
    if (isSuccess) {
      removeLending([nft]);
    }
  }, [nft, renft, setHash, removeLending]);

  return (
    <div className="Nft__card" onClick={handleStopLend}>
      <span className="Nft__button">Stop Lending</span>
    </div>
  );
};

export const AllMyLending: React.FC = () => {
  const { myLendings } = useRenft();
  return (
    <Box>
      <Box className="Catalogue">
        {myLendings.map((nft) => {
          const nftId = `${nft.contract?.address ?? ""}::${nft.tokenId}`;
          return (
            <CatalogueItem
              key={nftId}
              tokenId={nft.tokenId}
              nftAddress={nft.contract?.address ?? ""}
              image={nft.image}
            >
              <div className="Nft__card" style={{ marginTop: "8px" }}>
                <StopLendButton nft={nft} />
              </div>
            </CatalogueItem>
          );
        })}
      </Box>
    </Box>
  );
};

export default AllMyLending;
