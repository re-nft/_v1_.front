import React, { useState, useCallback, useContext, useEffect } from "react";

import { RENFT_SUBGRAPH_ID_SEPARATOR } from "../../../consts";
import GraphContext from "../../../contexts/graph";
import { Nft } from "../../../contexts/graph/classes";
import ItemWrapper from "../../../components/items-wrapper";
import BatchLendModal from "../../../modals/batch-lend";
import CatalogueItem from "../../../components/catalogue-item";
import ActionButton from "../../../components/action-button";
import CatalogueLoader from "../../../components/catalogue-loader";
import BatchBar from "../../../components/batch-bar";
import { BatchContext } from "../../../controller/batch-controller";
import Pagination from "../../../components/pagination";
import {
  PageContext,
  PageContextType,
} from "../../../controller/page-controller";
import createCancellablePromise from "../../../contexts/create-cancellable-promise";
import { NFTMetaContext } from "../../../contexts/NftMetaState";
import { nftId } from "../../../services/firebase";

const Lendings: React.FC = () => {
  const {
    checkedItems,
    checkedMap,
    countOfCheckedItems,
    onReset,
    onSetCheckedItem,
    onSetItems,
  } = useContext(BatchContext);
  const {
    totalPages,
    currentPageNumber,
    currentPage,
    onSetPage,
    onResetPage,
    onChangePage,
  } = useContext<PageContextType<Nft>>(PageContext);
  const { getUserNfts } = useContext(GraphContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [metas, fetchNfts] = useContext(NFTMetaContext);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    getUserNfts()
      .then((items: Nft[] | undefined) => {
        onChangePage(items || []);
        onSetItems(items || []);
        setIsLoading(false);
      })
      .catch((e) => {
        console.warn("could not fetch user nfts");
        console.warn(e);
      });
  }, [setIsLoading, getUserNfts, onChangePage, onSetItems]);

  const handleClose = useCallback(() => {
    setModalOpen(false);
    onReset();
    handleRefresh();
  }, [setModalOpen, onReset, handleRefresh]);

  const handleStartLend = useCallback(
    async (nft: Nft) => {
      onSetCheckedItem(nft);
      setModalOpen(true);
    },
    [setModalOpen, onSetCheckedItem]
  );

  const handleBatchModalOpen = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

  useEffect(() => {
    setIsLoading(true);

    const getUserNftsRequest = createCancellablePromise(getUserNfts());

    getUserNftsRequest.promise
      .then((items: Nft[] | undefined) => {
        onChangePage(items || []);
        onSetItems(items || []);
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
    fetchNfts(currentPage);
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
          nfts={checkedItems}
          open={modalOpen}
          onClose={handleClose}
        />
      )}
      <ItemWrapper>
        {currentPage.map((nft, ix) => (
          <CatalogueItem
            key={`${nft.address}${RENFT_SUBGRAPH_ID_SEPARATOR}${nft.tokenId}${ix}`}
            nft={nft}
            // TODO: this isn't a correct id. Should be nftAddress::tokenId::lendingId (if lending id exists, 0 otherwise)
            checked={checkedMap[nft.tokenId] || false}
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
      {countOfCheckedItems > 1 && (
        <BatchBar
          title={`Selected ${countOfCheckedItems} items`}
          actionTitle="Lend all"
          onCancel={onReset}
          onClick={handleBatchModalOpen}
        />
      )}
    </>
  );
};

export default React.memo(Lendings);
