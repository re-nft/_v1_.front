import React, { useContext, useCallback, useState } from "react";
import { Box } from "@material-ui/core";

import GraphContext from "../../contexts/Graph";
import { NftAndLendRentInfo } from "../../types";
import { PaymentToken } from "../../types";
import NumericField from "../NumericField";
import CatalogueItem from "../CatalogueItem";
import { useRenft } from "../../hooks/useRenft";
import { RentNftContext } from "../../hardhat/SymfoniContext";
import { TransactionStateContext } from "../../contexts/TransactionState";
import {CurrentAddressContext} from "../../hardhat/SymfoniContext";
import ReturnModal from './ReturnModal';
import { ProviderContext } from "../../hardhat/SymfoniContext";

type ReturnItButtonProps = {
  nft: NftAndLendRentInfo;
  onClick(nft: NftAndLendRentInfo): void;
};

const ReturnItButton: React.FC<ReturnItButtonProps> = ({ nft, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(nft);
  }, [onClick, nft]);
  return (
    <div className="Nft__card" style={{ marginTop: '8px' }} onClick={handleClick}>
      <span className="Nft__button">Return It</span>
    </div>
  );
};

export const AllMyRenting: React.FC = () => {
  const { allMyRenting } = useRenft();
  const [modalOpen, setModalOpen] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [currentAddress] = useContext(CurrentAddressContext);
  const { instance: renft } = useContext(RentNftContext);
  const [selectedNft, setSelectedNft] = useState<NftAndLendRentInfo>();
  const { setHash } = useContext(TransactionStateContext);
  const [provider] = useContext(ProviderContext);

  const handleReturnNft = useCallback(async (nft: NftAndLendRentInfo) => {
    if (!renft || !nft.contract) return;
    const tx = await renft.returnIt(
      [nft.contract.address],
      [nft.tokenId],
      [nft.lendingId]
    );
    const isSuccess = await setHash(tx.hash);
    if (isSuccess) {
      console.log('remove');
      setModalOpen(false);
    }
  }, [renft, setHash]);

  const handleApproveAll = useCallback(async (nft: NftAndLendRentInfo) => {
    if (!currentAddress || !renft || !nft.contract || !provider) return;
    const tx = await nft.contract.setApprovalForAll(renft.address, true);
    setHash(tx.hash);
    const receipt = await provider.getTransactionReceipt(tx.hash);
    const status = receipt.status ?? 0;
    if (status === 1) {
      setIsApproved(true);
    }
  }, []);

  const handleCloseModal = useCallback(() => setModalOpen(false),[]);

  const handleOpenModal = useCallback(
    async (nft: NftAndLendRentInfo) => {
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
    <Box>
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
      <Box className="Catalogue">
        {allMyRenting.map((nft: NftAndLendRentInfo) => {
          const id = `${nft.tokenId}`;
          const lending = nft.lendingRentInfo;
          return (
            <CatalogueItem
              key={id}
              tokenId={nft.tokenId}
              nftAddress={nft.contract?.address ?? ""}
              image={nft.image}
            >
              <NumericField
                text="Daily price"
                value={String(lending.dailyRentPrice)}
                unit={PaymentToken[lending.paymentToken]}
              />
              <NumericField
                text="Rent Duration"
                value={String(nft.rentingInfo?.rentDuration)}
                unit="days"
              />
              <div className="Nft__card">
                <ReturnItButton nft={nft} onClick={handleOpenModal}/>
              </div>
            </CatalogueItem>
          );
        })}
      </Box>
    </Box>
  );
};

export default AllMyRenting;
