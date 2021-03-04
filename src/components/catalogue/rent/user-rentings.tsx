import React, { useContext, useCallback, useState } from "react";
import { ERCNft } from "../../../contexts/graph/types";
import { PaymentToken } from "../../../types";
import NumericField from "../../numeric-field";
import CatalogueItem from "../../catalogue/catalogue-item";
import { RentNftContext } from "../../../hardhat/SymfoniContext";
import { TransactionStateContext } from "../../../contexts/TransactionState";
import { CurrentAddressContext } from "../../../hardhat/SymfoniContext";
import ReturnModal from "../modals/return";
import { ProviderContext } from "../../../hardhat/SymfoniContext";

type ReturnItButtonProps = {
  nft: ERCNft;
  onClick(nft: ERCNft): void;
};

const ReturnItButton: React.FC<ReturnItButtonProps> = ({ nft, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(nft);
  }, [onClick, nft]);
  return (
    <div
      className="Nft__card"
      style={{ marginTop: "8px" }}
      onClick={handleClick}
    >
      <span className="Nft__button">Return It</span>
    </div>
  );
};

const UserRentings: React.FC = () => {
  const allMyRentings: ERCNft[] = [];
  const [modalOpen, setModalOpen] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [currentAddress] = useContext(CurrentAddressContext);
  const { instance: renft } = useContext(RentNftContext);
  const [selectedNft, setSelectedNft] = useState<ERCNft>();
  const { setHash } = useContext(TransactionStateContext);
  const [provider] = useContext(ProviderContext);

  const handleReturnNft = useCallback(
    async (nft: ERCNft) => {
      if (!renft || !nft.contract) return;
      const tx = await renft.returnIt(
        [nft.contract.address],
        [nft.tokenId],
        // TODO
        //@ts-ignore
        [nft.lending?.[0]]
      );
      const isSuccess = await setHash(tx.hash);
      if (isSuccess) {
        setModalOpen(false);
      }
    },
    [renft, setHash]
  );

  const handleApproveAll = useCallback(
    async (nft: ERCNft) => {
      if (!currentAddress || !renft || !nft.contract || !provider) return;
      const tx = await nft.contract.setApprovalForAll(renft.address, true);
      setHash(tx.hash);
      const receipt = await provider.getTransactionReceipt(tx.hash);
      const status = receipt.status ?? 0;
      if (status === 1) {
        setIsApproved(true);
      }
    },
    [currentAddress, renft, provider, setHash]
  );

  const handleCloseModal = useCallback(() => setModalOpen(false), []);

  const handleOpenModal = useCallback(
    async (nft: ERCNft) => {
      if (!nft.contract || !renft || !currentAddress) return;
      const isApproved = await nft.contract.isApprovedForAll(
        currentAddress,
        renft.address
      );
      setSelectedNft(nft);
      setIsApproved(isApproved);
      setModalOpen(true);
    },
    [renft, currentAddress]
  );

  return (
    <>
      {selectedNft && (
        <ReturnModal
          open={modalOpen}
          nft={selectedNft}
          onClose={handleCloseModal}
          isApproved={isApproved}
          onReturn={handleReturnNft}
          onApproveAll={handleApproveAll}
        />
      )}
      {allMyRentings.map((nft: ERCNft) => {
        const id = `${nft.address}::${nft.tokenId}`;
        return (
          <CatalogueItem
            key={id}
            tokenId={nft.tokenId}
            nftAddress={nft.contract?.address ?? ""}
            // TODO: name it meta
            mediaURI={nft.tokenURI}
          >
            <NumericField
              text="Daily price"
              value={String(0)}
              unit={PaymentToken[PaymentToken.DAI]}
            />
            <NumericField text="Rent Duration" value={String(0)} unit="days" />
            <div className="Nft__card">
              <ReturnItButton nft={nft} onClick={handleOpenModal} />
            </div>
          </CatalogueItem>
        );
      })}
    </>
  );
};

export default UserRentings;
