import React, { useState, useCallback, useContext, useEffect } from "react";
import moment from "moment";

import { RENFT_SUBGRAPH_ID_SEPARATOR } from "../consts";
import GraphContext from "../contexts/graph/index";
import { Lending, Renting } from "../contexts/graph/classes";
import createCancellablePromise from "../contexts/create-cancellable-promise";
import { BatchContext } from "../controller/batch-controller";
import { TransactionStateContext } from "../contexts/TransactionState";
import CatalogueLoader from "../components/catalogue-loader";
import { PaymentToken } from "../types";
import { CurrentAddressContext } from "../hardhat/SymfoniContext";
import stopLend from "../services/stop-lending";
import claimCollateral from "../services/claim-collateral";
import { ReNFTContext } from "../hardhat/SymfoniContext";
import { getLendingPriceByCurreny, short } from "../utils";
import BatchBar from "../components/batch-bar";

const returnBy = (rentedAt: number, rentDuration: number) => {
  return moment.unix(rentedAt).add(rentDuration, "days");
};

enum DashboardViewType {
  LIST_VIEW,
  MINIATURE_VIEW,
}

// TODO: this code is not DRY
// TODO: lendings has this batch architecture too
// TODO: it would be good to abstract batching
// TODO: and pass components as children to the abstracted
// TODO: so that we do not repeat this batch code everywhere
export const Dashboard: React.FC = () => {
  const {
    checkedMap,
    countOfCheckedItems,
    onReset,
    onCheckboxChange,
    onSetItems,
  } = useContext(BatchContext);
  const [currentAddress] = useContext(CurrentAddressContext);
  const { getUserLending, getUserRenting } = useContext(GraphContext);
  const { instance: renft } = useContext(ReNFTContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lendingItems, setLendingItems] = useState<Lending[]>([]);
  const [rentingItems, setRentingItems] = useState<Renting[]>([]);
  const [__, setModalOpen] = useState(false);
  const { setHash } = useContext(TransactionStateContext);
  const _now = moment();
  const [viewType, _] = useState<DashboardViewType>(
    DashboardViewType.LIST_VIEW
  );

  const handleRefresh = useCallback(() => {
    Promise.all([getUserLending(), getUserRenting()])
      .then(([userLending, userRenting]) => {
        const _userLending = userLending || [];
        const _userRenting = userRenting || [];

        setLendingItems(_userLending);
        setRentingItems(_userRenting);

        onSetItems([..._userLending, ..._userRenting]);
        setIsLoading(false);
      })
      .catch(() => {
        console.warn("could not handle refresh");
      });
  }, [
    getUserLending,
    getUserRenting,
    onSetItems,
    setLendingItems,
    setRentingItems,
    setIsLoading,
  ]);

  const handleClaimCollateral = useCallback(
    async (lending: Lending) => {
      if (!renft) return;
      const tx = await claimCollateral(renft, [
        {
          address: lending.address,
          tokenId: lending.tokenId,
          lendingId: lending.id,
        },
      ]);
      await setHash(tx.hash);
      handleRefresh();
    },
    [renft, setHash, handleRefresh]
  );

  const handleStopLend = useCallback(
    async (lending: Lending) => {
      if (!renft) return;
      const tx = await stopLend(renft, [
        {
          address: lending.address,
          amount: lending.amount,
          lendingId: lending.lending.id,
          tokenId: lending.tokenId,
        },
      ]);
      await setHash(tx.hash);
      handleRefresh();
    },
    [renft, setHash, handleRefresh]
  );

  // todo: get rid of all of the ts-ignores

  const _returnBy = (lending: Lending) =>
    returnBy(
      // @ts-ignore
      lending.renting?.rentedAt,
      // @ts-ignore
      lending.renting?.rentDuration
    );
  const _claim = (lending: Lending) => _now.isAfter(_returnBy(lending));

  const handleBatchModalOpen = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

  const onCheckboxClick = useCallback(
    (lending: Lending) => {
      onCheckboxChange(
        `${lending.nftAddress}${RENFT_SUBGRAPH_ID_SEPARATOR}${lending.id}`,
        checkedMap[lending.id] == null ? true : !checkedMap[lending.id]
      );
    },
    [onCheckboxChange, checkedMap]
  );

  useEffect(() => {
    setIsLoading(true);

    const getUserLendingRequest = createCancellablePromise(
      Promise.all([getUserLending(), getUserRenting()])
    );

    getUserLendingRequest.promise
      .then(([userLending, userRenting]) => {
        const _userLending = userLending || [];
        const _userRenting = userRenting || [];

        console.log(_userLending);
        console.log(_userRenting);

        setLendingItems(_userLending);
        setRentingItems(_userRenting);

        onSetItems([..._userLending, ..._userRenting]);
        setIsLoading(false);
      })
      .catch(() => {
        console.warn("could not get user lending request");
      });

    return getUserLendingRequest.cancel;
    /* eslint-disable-next-line */
  }, []);

  if (isLoading) return <CatalogueLoader />;

  if (!isLoading && lendingItems.length === 0 && rentingItems.length === 0) {
    return (
      <div className="center">You aren&apos;t lending or renting anything</div>
    );
  }

  return (
    <div>
      {viewType === DashboardViewType.LIST_VIEW && (
        <div className="dashboard-list-view">
          {lendingItems.length !== 0 && !isLoading && (
            <div className="dashboard-section">
              <h2 className="lending">Lending</h2>
              <table className="list">
                <thead>
                  <tr>
                    <th style={{ width: "15%" }}>NFT Address</th>
                    <th style={{ width: "7%" }}>TokenId</th>
                    <th style={{ width: "7%" }}>Amount</th>
                    <th style={{ width: "10%" }}>Pmt in</th>
                    <th style={{ width: "11%" }}>Collateral</th>
                    <th style={{ width: "7%" }}>Rent</th>
                    <th style={{ width: "7%" }}>Duration</th>
                    <th style={{ width: "7%" }}>Batch Select</th>
                    <th style={{ width: "20%" }} className="action-column">
                      &nbsp;
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lendingItems.map((lend: Lending, ix: number) => {
                    const lending = lend.lending;
                    return (
                      <tr
                        key={`${lend.address}${RENFT_SUBGRAPH_ID_SEPARATOR}${lend.tokenId}${RENFT_SUBGRAPH_ID_SEPARATOR}${ix}`}
                      >
                        <td className="column">{short(lending.nftAddress)}</td>
                        <td className="column">{lend.tokenId}</td>
                        <td className="column">{lend.amount}</td>
                        <td className="column">
                          {PaymentToken[lending.paymentToken ?? 0]}
                        </td>
                        <td className="column">
                          {getLendingPriceByCurreny(
                            lending.nftPrice,
                            lending.paymentToken
                          )}
                        </td>
                        <td className="column">
                          {getLendingPriceByCurreny(
                            lending.dailyRentPrice,
                            lending.paymentToken
                          )}
                        </td>
                        <td className="column">
                          {lending.maxRentDuration} days
                        </td>
                        <td className="action-column">
                          <div
                            onClick={() => onCheckboxClick(lend)}
                            className={`checkbox ${
                              checkedMap[lending.id] ? "checked" : ""
                            }`}
                            style={{ margin: "auto", marginTop: "1em" }}
                          />
                        </td>
                        <td className="action-column">
                          {_claim(lend) && (
                            <span
                              className="nft__button small"
                              onClick={() => handleClaimCollateral(lend)}
                            >
                              💰
                            </span>
                          )}
                          {!_claim(lend) && !lend.lending.renting && (
                            <span
                              className="nft__button small"
                              onClick={() => handleStopLend(lend)}
                            >
                              Stop lend
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {rentingItems.length !== 0 && !isLoading && (
            <div className="dashboard-section">
              <h2 className="renting">Renting</h2>
              <table className="list">
                <thead>
                  <tr>
                    <th style={{ width: "15%" }}>NFT Address</th>
                    <th style={{ width: "7%" }}>TokenId</th>
                    <th style={{ width: "7%" }}>Amount</th>
                    <th style={{ width: "10%" }}>Pmt in</th>
                    <th style={{ width: "7%" }}>Duration</th>
                    <th style={{ width: "11%" }}>Rented At</th>
                    <th style={{ width: "7%" }}>Rent</th>
                    <th style={{ width: "20%" }} className="action-column">
                      &nbsp;
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rentingItems.map((rent: Renting, ix: number) => {
                    const renting = rent.renting;
                    return (
                      <tr
                        key={`${rent.address}${RENFT_SUBGRAPH_ID_SEPARATOR}${rent.tokenId}${RENFT_SUBGRAPH_ID_SEPARATOR}${ix}`}
                      >
                        <td className="column">
                          {short(renting.renterAddress)}
                        </td>
                        <td className="column">{rent.tokenId}</td>
                        <td className="column">{renting.lending.amount}</td>
                        <td className="column">
                          {PaymentToken[renting.lending.paymentToken ?? 0]}
                        </td>
                        <td className="column">{renting.rentDuration} days</td>
                        <td className="column">
                          {moment(Number(renting.rentedAt) * 1000).format(
                            "MM/D/YY hh:mm"
                          )}
                        </td>
                        <td className="column">
                          {renting.lending.dailyRentPrice}
                        </td>
                        <td className="action-column">
                          {renting.lending.lenderAddress !==
                            currentAddress.toLowerCase() && (
                            <span className="nft__button small">Return It</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {viewType === DashboardViewType.MINIATURE_VIEW && <div>miniature</div>}
      {countOfCheckedItems > 1 && (
        <BatchBar
          title={`Selected ${countOfCheckedItems} items`}
          actionTitle="Lend all"
          onCancel={onReset}
          onClick={handleBatchModalOpen}
        />
      )}
    </div>
  );
};

export default React.memo(Dashboard);
