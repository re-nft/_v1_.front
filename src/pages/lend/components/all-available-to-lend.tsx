import React, { useState, useCallback, useContext, useEffect } from "react";

import GraphContext from "../../../contexts/graph";
import { Nft } from "../../../contexts/graph/classes";
import ItemWrapper from "../../../components/items-wrapper";
import BatchLendModal from "../../../modals/batch-lend";
import CatalogueItem from "../../../components/catalogue-item";
import ActionButton from "../../../components/action-button";
import CatalogueLoader from "../../../components/catalogue-loader";
import BatchBar from "../../../components/batch-bar";
import {
  BatchContext,
  getUniqueID,
} from "../../../controller/batch-controller";
import Pagination from "../../../components/pagination";
import {
  PageContext,
  PageContextType,
} from "../../../controller/page-controller";
import createCancellablePromise from "../../../contexts/create-cancellable-promise";
import { NFTMetaContext } from "../../../contexts/NftMetaState";

const Lendings: React.FC = () => {
  const { checkedItems, checkedNftItems, handleReset, onCheckboxChange } =
    useContext(BatchContext);
  const {
    totalPages,
    currentPageNumber,
    currentPage,
    onSetPage,
    onResetPage,
    onChangePage,
  } = useContext<PageContextType<Nft>>(PageContext);
  const { getAllAvailableToLend } = useContext(GraphContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [_, fetchNfts] = useContext(NFTMetaContext)

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    getAllAvailableToLend()
      .then((nfts) => {
        onChangePage(nfts);
        setIsLoading(false);
      })
      .catch(() => {
        console.warn("could not fetch user nfts");
      });
  }, [setIsLoading, getAllAvailableToLend, onChangePage]);

  const handleClose = useCallback(() => {
    setModalOpen(false);
    handleReset();
    handleRefresh();
  }, [setModalOpen, handleReset, handleRefresh]);

  const handleStartLend = useCallback(
    async (nft: Nft) => {
      onCheckboxChange(nft);
      setModalOpen(true);
    },
    [setModalOpen, onCheckboxChange]
  );

  const handleBatchModalOpen = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

  useEffect(() => {
    setIsLoading(true);

    const getUserNftsRequest = createCancellablePromise(
      getAllAvailableToLend()
    );

    getUserNftsRequest.promise
      .then((nfts) => {
        onChangePage(nfts);
        setIsLoading(false);
      })
      .catch(() => {
        console.warn("could not get user nfts request");
      });

    return () => {
      onResetPage();
      return getUserNftsRequest.cancel();
    };
  }, [getUserNfts, onChangePage, onResetPage, onSetItems]);


  //Prefetch metadata
  useEffect(() => {
    fetchNfts(currentPage)
  }, [currentPage, fetchNfts]);

  if (isLoading) {
    return <CatalogueLoader />;
  }

  if (!isLoading && currentPage.length === 0) {
    return <div className="center">You don&apos;t have any NFTs to lend</div>;
  }

  return (
    <>
      {modalOpen && (
        <BatchLendModal
          nfts={checkedNftItems}
          open={modalOpen}
          onClose={handleClose}
        />
      )}
      <ItemWrapper>
        {currentPage.map((nft) => (
          <CatalogueItem
            key={getUniqueID(nft.address, nft.tokenId)}
            nft={nft}
            checked={
              !!checkedItems[getUniqueID(nft.address, nft.tokenId)] || false
            }
          >
            <ActionButton<Nft>
              nft={nft}
              title="Lend now"
              onClick={handleStartLend}
            />
          </CatalogueItem>
        ))}
      </ItemWrapper>
      <Pagination
        totalPages={totalPages}
        currentPageNumber={currentPageNumber}
        onSetPage={onSetPage}
      />
      {checkedNftItems.length > 1 && (
        <BatchBar
          title={`Selected ${checkedNftItems.length} items`}
          actionTitle="Lend All"
          onCancel={handleReset}
          onClick={handleBatchModalOpen}
        />
      )}
    </>
  );
};

export default React.memo(Lendings);
