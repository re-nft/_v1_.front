import React, { useState, useCallback, useContext, useMemo } from "react";
import moment from "moment";

import { Lending, Renting } from "../contexts/graph/classes";
import {
  BatchContext,
  getUniqueID,
  isClaimable,
  useCheckedClaims,
  useCheckedLendingItems,
  useCheckedRentingItems,
} from "../controller/batch-controller";
import { TransactionStateContext } from "../contexts/TransactionState";
import CatalogueLoader from "../components/catalogue-loader";
import { PaymentToken } from "../types";
import { short } from "../utils";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import { useStopLend } from "../hooks/useStopLend";
import createCancellablePromise from "../contexts/create-cancellable-promise";
import { UserLendingContext } from "../contexts/UserLending";
import { UserRentingContext } from "../contexts/UserRenting";
import { useReturnIt } from "../hooks/useReturnIt";
import { useClaimColleteral } from "../hooks/useClaimColleteral";
import MultipleBatchBar from "../components/multiple-batch-bar";

enum DashboardViewType {
  LIST_VIEW,
  MINIATURE_VIEW,
}

type CheckboxProps = {
  onCheckboxClick: (nft: Lending | Renting) => void;
  nft: Lending | Renting;
};

type StopLendButtonProps = {
  handleStopLend: (lending: Lending[]) => void;
  lend: Lending;
};

type ClaimColleteralButtonProps = {
  claimColleteral: (lending: Lending[]) => void;
  lend: Lending;
};

type ReturnNftButtonProps = {
  handleReturnNft: (renting: Renting[]) => void;
  rent: Renting;
};

const ReturnNftButton: React.FC<ReturnNftButtonProps> = ({
  handleReturnNft,
  rent,
}) => {
  const handleClick = useCallback(() => {
    return handleReturnNft([rent]);
  }, [handleReturnNft, rent]);
  return (
    <button className="nft__button small" onClick={handleClick}>
      Return It
    </button>
  );
};

const StopLendButton: React.FC<StopLendButtonProps> = ({
  handleStopLend,
  lend,
}) => {
  const handleClick = useCallback(() => {
    return handleStopLend([lend]);
  }, [handleStopLend, lend]);
  return (
    <button className="nft__button small" onClick={handleClick}>
      Stop lend
    </button>
  );
};

const ClaimCollateralButton: React.FC<ClaimColleteralButtonProps> = ({
  claimColleteral,
  lend,
}) => {
  const claimable = useMemo(
    () => lend.renting && isClaimable(lend.renting),
    [lend]
  );
  const handleClick = useCallback(() => {
    if (!claimable) return;
    return claimColleteral([lend]);
  }, [claimColleteral, lend, claimable]);
  return (
    <button
      className={`nft__button small ${claimable ? "" : "disabled"}`}
      onClick={handleClick}
    >
      Claim
    </button>
  );
};

const Checkbox: React.FC<CheckboxProps> = ({ onCheckboxClick, nft }) => {
  const { checkedItems } = useContext(BatchContext);

  const handleClick = useCallback(() => {
    return onCheckboxClick(nft);
  }, [onCheckboxClick, nft]);

  return (
    <div
      onClick={handleClick}
      className={`checkbox ${
        checkedItems[getUniqueID(nft.address, nft.tokenId, nft.lending.id)]
          ? "checked"
          : ""
      }`}
      style={{ margin: "auto", marginTop: "1em" }}
    />
  );
};

// TODO: this code is not DRY
// TODO: lendings has this batch architecture too
// TODO: it would be good to abstract batching
// TODO: and pass components as children to the abstracted
// TODO: so that we do not repeat this batch code everywhere
export const Dashboard: React.FC = () => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const {
    onCheckboxChange,
    handleResetLending,
  } = useContext(BatchContext);
  const checkedLendingItems = useCheckedLendingItems();
  const checkedRentingItems = useCheckedRentingItems();
  const checkedClaims = useCheckedClaims()
  const { userRenting: rentingItems, isLoading: userRentingLoading } =
    useContext(UserRentingContext);
  const { userLending: lendingItems, isLoading: userLendingLoading } =
    useContext(UserLendingContext);
  const { setHash } = useContext(TransactionStateContext);
  const [viewType, _] = useState<DashboardViewType>(
    DashboardViewType.LIST_VIEW
  );
  const stopLending = useStopLend();
  const claim = useClaimColleteral();

  const claimCollateral = useCallback(
    async () => {
      const claims = checkedClaims.map((lending) => ({
        address: lending.address,
        tokenId: lending.tokenId,
        lendingId: lending.id,
        amount: lending.amount,
      }));
      claim(claims).then((tx) => {
        if (tx) setHash(tx.hash);
        handleResetLending();
      });
    },
    [checkedClaims, claim, handleResetLending, setHash]
  );

  const handleStopLend = useCallback(
    (lending: Lending[]) => {
      // ! eniko: don't know if it is good to refresh so quickly in stop lend
      // ! eniko: there is no update on the front that transaction is pending at all
      const transaction = createCancellablePromise(
        stopLending(
          lending.map((l) => ({
            address: l.address,
            amount: l.amount,
            lendingId: l.lending.id,
            tokenId: l.tokenId,
          }))
        )
      );

      transaction.promise.then((tx) => {
        if (tx) setHash(tx.hash);
        handleResetLending(lending.map((m) => m.id));
      });
    },
    [stopLending, setHash, handleResetLending]
  );

  const onCheckboxClick = useCallback(
    (lending: Lending | Renting) => {
      onCheckboxChange(lending);
    },
    [onCheckboxChange]
  );

  const isLoading = userLendingLoading || userRentingLoading;

  const returnItems = useMemo(() => {
    return checkedRentingItems.map((item) => ({
      id: item.id,
      address: item.address,
      tokenId: item.tokenId,
      lendingId: item.renting.lendingId,
      amount: item.renting.lending.lentAmount,
      contract: item.contract,
    }));
  }, [checkedRentingItems]);
  const returnIt = useReturnIt(returnItems);
  const handleStopLendAll = useCallback(()=>{
    return handleStopLend(lendingItems)
  }, [handleStopLend, lendingItems])

  const handleReturnNft = useCallback(
    (nft) => {
      onCheckboxChange(nft);
      returnIt();
    },
    [onCheckboxChange, returnIt]
  );

  if (isLoading && lendingItems.length === 0 && rentingItems.length === 0)
    return <CatalogueLoader />;

  if (!isLoading && lendingItems.length === 0 && rentingItems.length === 0) {
    return (
      <div className="center">You aren&apos;t lending or renting anything</div>
    );
  }

  return (
    <div>
      {viewType === DashboardViewType.LIST_VIEW && (
        <div className="dashboard-list-view">
          {lendingItems.length !== 0 && (
            <div className="dashboard-section">
              <h2 className="lending">Lending</h2>
              <h3 style={{ color: "white", marginBottom: "1em" }}>
                Here you will find the NFTs that you are lending. These can also
                be found in the Lending tab after you toggle the view.
              </h3>
              <table className="list">
                <thead>
                  <tr>
                    <th style={{ width: "15%" }}>Address</th>
                    <th style={{ width: "7%" }}>ID</th>
                    <th style={{ width: "5%" }}>Amount</th>
                    <th style={{ width: "5%" }}>Pmt in</th>
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
                  {lendingItems.map((lend: Lending) => {
                    const lending = lend.lending;
                    return (
                      <tr
                        key={getUniqueID(lend.address, lend.tokenId, lend.id)}
                      >
                        <td className="column">{short(lending.nftAddress)}</td>
                        <td className="column">{lend.tokenId}</td>
                        <td className="column">{lend.amount}</td>
                        <td className="column">
                          {PaymentToken[lending.paymentToken ?? 0]}
                        </td>
                        <td className="column">{lending.nftPrice}</td>
                        <td className="column">{lending.dailyRentPrice}</td>
                        <td className="column">
                          {lending.maxRentDuration} days
                        </td>
                        <td className="action-column">
                          <Checkbox
                            onCheckboxClick={onCheckboxClick}
                            nft={lend}
                          />
                        </td>
                        <td className="action-column">
                          <ClaimCollateralButton
                            claimColleteral={claimCollateral}
                            lend={lend}
                          />
                        </td>
                        <td className="action-column">
                          <StopLendButton
                            handleStopLend={handleStopLend}
                            lend={lend}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {rentingItems.length !== 0 && (
            <div className="dashboard-section">
              <h2 className="renting">Renting</h2>
              <h3 style={{ color: "white", marginBottom: "1em" }}>
                Here you will find the NFTs that you are renting. These can also
                be found in the renting tab, after you toggle the view.
              </h3>
              <table className="list">
                <thead>
                  <tr>
                    <th style={{ width: "15%" }}>Address</th>
                    <th style={{ width: "5%" }}>ID</th>
                    <th style={{ width: "5%" }}>Amount</th>
                    <th style={{ width: "7%" }}>Pmt in</th>
                    <th style={{ width: "7%" }}>Collateral</th>
                    <th style={{ width: "11%" }}>Rented On</th>
                    <th style={{ width: "7%" }}>Duration</th>
                    <th style={{ width: "7%" }}>Due Date</th>
                    <th style={{ width: "7%" }}>Batch Select</th>
                    <th style={{ width: "20%" }} className="action-column">
                      &nbsp;
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rentingItems.map((rent: Renting) => {
                    const renting = rent.renting;
                    return (
                      <tr
                        key={getUniqueID(
                          rent.lending.nftAddress,
                          rent.lending.tokenId,
                          renting.lendingId
                        )}
                      >
                        <td className="column">
                          {short(renting.lending.nftAddress)}
                        </td>
                        <td className="column">{rent.tokenId}</td>
                        <td className="column">{renting.lending.lentAmount}</td>
                        <td className="column">
                          {PaymentToken[renting.lending.paymentToken ?? 0]}
                        </td>
                        <td className="column">{renting.rentDuration} days</td>
                        <td className="column">
                          {moment(Number(renting.rentedAt) * 1000).format(
                            "MM/D/YY hh:mm"
                          )}
                        </td>
                        <td className="column">{renting.rentDuration} days</td>
                        <td className="column">
                          {renting.lending.dailyRentPrice}
                        </td>
                        <td className="action-column">
                          <Checkbox
                            onCheckboxClick={onCheckboxClick}
                            nft={rent}
                          />
                        </td>
                        <td className="action-column">
                          {renting.lending.lenderAddress !==
                            currentAddress.toLowerCase() && (
                            <ReturnNftButton
                              handleReturnNft={handleReturnNft}
                              rent={rent}
                            />
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
      <MultipleBatchBar
        title={`Selected ${checkedLendingItems.length} items`}
        claimsNumber={checkedClaims.length}
        rentingNumber={checkedRentingItems.length}
        lendingNumber={checkedLendingItems.length}
        onClaim={claimCollateral}
        onStopRent={returnIt}
        onStopLend={handleStopLendAll}
      />
    </div>
  );
};

export default React.memo(Dashboard);
