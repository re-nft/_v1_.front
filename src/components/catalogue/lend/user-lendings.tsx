import React, { useContext, useCallback, useState, useEffect } from "react";
import { BigNumber } from "ethers";
import { RentNftContext } from "../../../hardhat/SymfoniContext";
import GraphContext from "../../../contexts/Graph";
import { ERCNft } from "../../../contexts/Graph/types";
import { TransactionStateContext } from "../../../contexts/TransactionState";
import CatalogueItem from "../../catalogue/catalogue-item";

type StopLendButtonProps = {
  nft: ERCNft;
};

// todo: handleStopLend batch as well
const StopLendButton: React.FC<StopLendButtonProps> = ({ nft }) => {
  const { instance: renft } = useContext(RentNftContext);
  const { setHash } = useContext(TransactionStateContext);
  const { removeLending } = useContext(GraphContext);

  const handleStopLend = useCallback(async () => {
    const lending = nft.lending?.[nft.lending?.length - 1];

    if (!renft || !nft.contract || !lending) return;
    if (nft.lending?.length === nft.renting?.length) {
      // ! we should forbid this from happening, by some sort of visual cue
      // ! for example, a green outline around your lendings means they are
      // ! being currently rented by someone
      console.warn("can't stop lend. it is being rented by someone");
      return;
    }

    // todo: another point: if someone is renting we also need
    // to show the button: "Claim Collateral" in place of Stop Lending
    // This button will be active ONLY if the renter exceeded their
    // rent duration (that they choose in the modal in the Rent tab)
    const tx = await renft.stopLending(
      [nft.contract.address],
      [nft.tokenId],
      [BigNumber.from("100")]
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

const UserLendings: React.FC = () => {
  const { getLending } = useContext(GraphContext);
  const [usersLending, setUsersLending] = useState<ERCNft[]>([]);

  useEffect(() => {
    getLending()
      .then((data) => {
        setUsersLending(data);
      })
      .catch((e) => {
        console.warn(e);
        return [];
      });
  }, [getLending]);

  return (
    <>
      {usersLending.map((nft) => {
        const nftAddress = `${nft.contract?.address ?? ""}`;
        const nftId = `${nftAddress}::${nft.tokenId}`;
        return (
          <CatalogueItem
            key={nftId}
            tokenId={nft.tokenId}
            nftAddress={nftAddress}
            mediaURI={nft.meta?.mediaURI}
          >
            <div className="Nft__card" style={{ marginTop: "8px" }}>
              <StopLendButton nft={nft} />
            </div>
          </CatalogueItem>
        );
      })}
    </>
  );
};

export default UserLendings;
