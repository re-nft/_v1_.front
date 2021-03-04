import React, { useCallback, useState } from "react";
import { Nft } from "../../../contexts/graph/classes";
import { PaymentToken } from "../../../types";
import NumericField from "../../forms/numeric-field";
import CatalogueItem from "../../catalogue/catalogue-item";
import ReturnModal from "../modals/return";
import ActionButton from "../../forms/action-button";
import CatalogueLoader from "../catalogue-loader";

const UserRentings: React.FC = () => {
  const allMyRentings: Nft[] = [];
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNft, setSelectedNft] = useState<Nft>();
  const handleCloseModal = useCallback(() => setModalOpen(false), []);
  const handleOpenModal = useCallback(
    async (nft: Nft) => {
      setSelectedNft(nft);
      setModalOpen(true);
    },
    [setSelectedNft, setModalOpen]
  );

  if (allMyRentings.length === 0) {
    return <CatalogueLoader />;
  }

  return (
    <>
      {selectedNft && (
        <ReturnModal
          open={modalOpen}
          nft={selectedNft}
          onClose={handleCloseModal}
        />
      )}
      {allMyRentings.map((nft: Nft) => {
        const id = `${nft.address}::${nft.tokenId}`;
        return (
          <CatalogueItem key={id} nft={nft}>
            <NumericField
              text="Daily price"
              value={String(0)}
              unit={PaymentToken[PaymentToken.DAI]}
            />
            <NumericField text="Rent Duration" value={String(0)} unit="days" />
            <ActionButton
              title="Return It"
              nft={nft}
              onClick={handleOpenModal}
            />
          </CatalogueItem>
        );
      })}
    </>
  );
};

export default UserRentings;
