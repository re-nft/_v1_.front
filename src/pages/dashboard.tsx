import React, { useState, useCallback, useContext, useMemo } from "react";
import moment from "moment";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import { Lending, Nft, Renting } from "../contexts/graph/classes";
import {
  getUniqueCheckboxId,
  isClaimable,
  useBatchItems
} from "../controller/batch-controller";
import CatalogueLoader from "../components/catalogue-loader";
import { PaymentToken } from "../types";
import { nftReturnIsExpired, short } from "../utils";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import { UserLendingContext } from "../contexts/UserLending";
import { UserRentingContext } from "../contexts/UserRenting";
import MultipleBatchBar from "../components/multiple-batch-bar";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { ShortenPopover } from "../components/common/shorten-popover";
import Checkbox from "../components/common/checkbox";
import { TimestampContext } from "../contexts/TimestampProvider";
import { Button } from "../components/common/button";
import UserContext from "../contexts/UserProvider";
import { CountDown } from "../components/common/countdown";
import ReturnModal from "../modals/return-modal";
import StopLendModal from "../modals/stop-lend-modal";
import ClaimModal from "../modals/claim-modal";
import { Tooltip } from "@material-ui/core";
import { Toggle } from "../components/common/toggle";

enum DashboardViewType {
  LIST_VIEW,
  MINIATURE_VIEW
}

export const Dashboard: React.FC = () => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const { signer } = useContext(UserContext);
  const [isClaimModalOpen, toggleClaimModal] = useState(false);
  const [isLendModalOpen, toggleLendModal] = useState(false);
  const [isReturnModalOpen, toggleReturnModal] = useState(false);
  const [showClaimed, toggleClaimed] = useState(true);

  const {
    onCheckboxChange,
    handleResetLending,
    handleResetRenting,
    checkedItems,
    checkedLendingItems,
    checkedRentingItems,
    checkedClaims
  } = useBatchItems();
  const { userRenting: rentingItems, isLoading: userRentingLoading } =
    useContext(UserRentingContext);
  const { userLending: lendingItems, isLoading: userLendingLoading } =
    useContext(UserLendingContext);
  const [viewType, _] = useState<DashboardViewType>(
    DashboardViewType.LIST_VIEW
  );

  const isLoading = userLendingLoading || userRentingLoading;

  const relendedLendingItems = useMemo(() => {
    if (!rentingItems) return [];
    const ids = new Set(
      rentingItems.map((r) => `${r.nftAddress}:${r.tokenId}`)
    );
    return lendingItems
      .map((l) => {
        return {
          ...l,
          relended: ids.has(`${l.nftAddress}:${l.tokenId}`)
        };
      })
      .filter((l) => {
        if (!showClaimed) {
          return !l.lending.collateralClaimed;
        }
        return true;
      });
  }, [lendingItems, rentingItems, showClaimed]);

  const relendedRentingItems = useMemo(() => {
    if (!rentingItems) return [];
    const ids = new Set(
      lendingItems.map((r) => `${r.nftAddress}:${r.tokenId}`)
    );
    return rentingItems
      .map((l) => {
        return {
          ...l,
          relended: ids.has(`${l.nftAddress}:${l.tokenId}`)
        };
      })
      .filter((l) => {
        if (!showClaimed) {
          return !l.lending.collateralClaimed;
        }
        return true;
      });
  }, [lendingItems, rentingItems, showClaimed]);

  const lendinItemsStopLendable = useMemo(() => {
    return checkedLendingItems.filter((v) => !v.renting);
  }, [checkedLendingItems]);

  const checkBoxChangeWrapped = useCallback(
    (nft) => {
      return () => {
        onCheckboxChange(nft);
      };
    },
    [onCheckboxChange]
  );
  const checkedClaimsLength = useMemo(() => {
    return checkedClaims.length;
  }, [checkedClaims]);
  const checkedRentingLength = useMemo(() => {
    return checkedRentingItems.length;
  }, [checkedRentingItems]);
  const lendinItemsStopLendableLength = useMemo(() => {
    return lendinItemsStopLendable.length;
  }, [lendinItemsStopLendable]);

  const toggleClaimSwitch = useCallback(() => {
    toggleClaimed(!showClaimed);
  }, [showClaimed]);

  const toggleTitle = useMemo(() => {
    return showClaimed ? "Hide claimed items" : "Show claimed items";
  }, [showClaimed]);

  if (!signer) {
    return (
      <div className="center content__message">Please connect your wallet!</div>
    );
  }

  if (isLoading && lendingItems.length === 0 && rentingItems.length === 0)
    return <CatalogueLoader />;

  if (!isLoading && lendingItems.length === 0 && rentingItems.length === 0) {
    return (
      <div className="center content__message">
        You aren&apos;t lending or renting yet. To start lending, head to the
        lend tab.
      </div>
    );
  }

  return (
    <div>
      {isReturnModalOpen && (
        <ReturnModal
          nfts={checkedRentingItems}
          open={isReturnModalOpen}
          onClose={() => {
            toggleReturnModal(false);
            handleResetRenting(
              checkedRentingItems.map((i) => getUniqueCheckboxId(i))
            );
          }}
        />
      )}
      {isLendModalOpen && (
        <StopLendModal
          nfts={checkedLendingItems}
          open={isLendModalOpen}
          onClose={() => {
            toggleLendModal(false);
            handleResetLending(
              checkedLendingItems.map((i) => getUniqueCheckboxId(i))
            );
          }}
        />
      )}
      {isClaimModalOpen && (
        <ClaimModal
          nfts={checkedClaims}
          open={isClaimModalOpen}
          onClose={() => {
            toggleClaimModal(false);
            handleResetLending(
              checkedClaims.map((i) => getUniqueCheckboxId(i))
            );
          }}
        />
      )}
      {viewType === DashboardViewType.LIST_VIEW && (
        <div className="dashboard-list-view">
          <Toggle
            toggleValue={showClaimed}
            onSwitch={toggleClaimSwitch}
            title={toggleTitle}
          />
          {lendingItems.length !== 0 && (
            <div className="dashboard-section">
              <h2 className="dashboard-header dashboard-header__lending"></h2>
              <h3 style={{ color: "white", marginBottom: "1em" }}>
                Here you will find The NFTs That you are lending. These can also
                be found in The Lending tab after you toggle The view.
              </h3>
              <Table className="list">
                <Thead>
                  <Tr>
                    <Th style={{ widTh: "7%" }}>Batch Select</Th>

                    <Th style={{ widTh: "15%" }}>Address</Th>
                    <Th style={{ widTh: "7%" }}>ID</Th>
                    <Th style={{ widTh: "5%" }}>Amount</Th>
                    <Th style={{ widTh: "5%" }}>$</Th>
                    <Th style={{ widTh: "11%" }}>Collateral</Th>
                    <Th style={{ widTh: "7%" }}>Daily Price</Th>
                    <Th style={{ widTh: "7%" }}>Duration</Th>
                    <Th style={{ widTh: "7%" }}>Original owner</Th>
                    <Th style={{ widTh: "10%" }} className="action-column">
                      &nbsp;
                    </Th>
                    <Th style={{ widTh: "10%" }} className="action-column">
                      &nbsp;
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {relendedLendingItems.map(
                    (lend: Lending & { relended: boolean }) => {
                      const id = getUniqueCheckboxId(lend);
                      const hasRenting = !!lend.renting;
                      const checked = !!checkedItems[id];
                      return (
                        <LendingRow
                          key={id}
                          hasRenting={hasRenting}
                          checked={checked}
                          lend={lend}
                          openClaimModal={toggleClaimModal}
                          openLendModal={toggleLendModal}
                          checkBoxChangeWrapped={checkBoxChangeWrapped}
                        ></LendingRow>
                      );
                    }
                  )}
                </Tbody>
              </Table>
            </div>
          )}
          {rentingItems.length !== 0 && (
            <div className="dashboard-section">
              <h2 className="dashboard-header dashboard-header__renting"></h2>
              <h3 style={{ color: "white", marginBottom: "1em" }}>
                Here you will find The NFTs That you are renting. These can also
                be found in The renting tab, after you toggle The view.
              </h3>
              <Table className="list">
                <Thead>
                  <Tr>
                    <Th style={{ widTh: "7%" }}>Batch Select</Th>
                    <Th style={{ widTh: "15%" }}>Address</Th>
                    <Th style={{ widTh: "5%" }}>ID</Th>
                    <Th style={{ widTh: "5%" }}>Amount</Th>
                    <Th style={{ widTh: "7%" }}>$</Th>
                    <Th style={{ widTh: "7%" }}>Collateral</Th>
                    <Th style={{ widTh: "7%" }}>Daily Price</Th>
                    <Th style={{ widTh: "7%" }}>Duration</Th>
                    <Th style={{ widTh: "11%" }}>Rented On</Th>
                    <Th style={{ widTh: "7%" }}>Due Date</Th>

                    <Th style={{ widTh: "20%" }} className="action-column">
                      &nbsp;
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {relendedRentingItems.map(
                    (rent: Renting & { relended: boolean }) => {
                      const checked = !!checkedItems[getUniqueCheckboxId(rent)];
                      const isExpired = nftReturnIsExpired(rent);
                      return (
                        <RentingRow
                          checked={checked}
                          rent={rent}
                          key={getUniqueCheckboxId(rent)}
                          openModal={toggleReturnModal}
                          currentAddress={currentAddress}
                          checkBoxChangeWrapped={checkBoxChangeWrapped}
                          isExpired={isExpired}
                        ></RentingRow>
                      );
                    }
                  )}
                </Tbody>
              </Table>
            </div>
          )}
        </div>
      )}
      <MultipleBatchBar
        claimsNumber={checkedClaimsLength}
        rentingNumber={checkedRentingLength}
        lendingNumber={lendinItemsStopLendableLength}
        onClaim={() => {
          toggleClaimModal(true);
        }}
        onStopRent={() => {
          toggleReturnModal(true);
        }}
        onStopLend={() => {
          toggleLendModal(true);
        }}
      />
    </div>
  );
};

const RentingRow: React.FC<{
  checked: boolean;
  rent: Renting & { relended: boolean };
  openModal: (t: boolean) => void;
  currentAddress: string;
  checkBoxChangeWrapped: (nft: Renting) => () => void;
  isExpired: boolean;
}> = ({
  checked,
  rent,
  checkBoxChangeWrapped,
  currentAddress,
  isExpired,
  openModal
}) => {
  const renting = rent.renting;
  const handleClick = useCallback(() => {
    checkBoxChangeWrapped(rent)();
    openModal(true);
  }, [checkBoxChangeWrapped, openModal]);
  const handleRowClicked = useCallback(() => {
    if (isExpired || rent.relended) return;
    checkBoxChangeWrapped(rent)();
  }, [checkBoxChangeWrapped, rent, isExpired]);
  const days = renting.rentDuration;

  const expireDate = moment(Number(renting.rentedAt) * 1000).add(
    renting.rentDuration,
    "day"
  );
  let tooltip = "Return NFT";
  tooltip = isExpired
    ? "The NFT is expired. You cannot return it anymore."
    : tooltip;
  tooltip = rent.relended
    ? "Please stop lending this item first. Then you can return it!"
    : tooltip;
  return (
    <Tr onClick={handleRowClicked}>
      <Td className="action-column">
        <Checkbox
          handleClick={checkBoxChangeWrapped(rent)}
          checked={checked}
          disabled={isExpired || rent.relended}
        />
      </Td>
      <Td className="column">{short(renting.lending.nftAddress)}</Td>
      <Td className="column">{rent.tokenId}</Td>
      <Td className="column">{renting.lending.lentAmount}</Td>
      <Td className="column">
        {PaymentToken[renting.lending.paymentToken ?? 0]}
      </Td>
      <Td className="column">
        {renting.lending.nftPrice * Number(renting.lending.lentAmount)}
      </Td>
      <Td className="column">{renting.lending.dailyRentPrice}</Td>
      <Td className="column">
        {days} {days > 1 ? "days" : "day"}
      </Td>

      <Td className="column">
        {moment(Number(renting.rentedAt) * 1000).format("MM/D/YY hh:mm")}
      </Td>
      <Td className="column">
        <CountDown endTime={expireDate.toDate().getTime()} />
      </Td>

      <Td className="action-column">
        {renting.lending.lenderAddress !== currentAddress.toLowerCase() && (
          <Tooltip title={tooltip} aria-label={tooltip}>
            <span>
              <Button
                handleClick={handleClick}
                disabled={checked || isExpired || rent.relended}
                description="Return it"
              />
            </span>
          </Tooltip>
        )}
      </Td>
    </Tr>
  );
};

// this keeps rerendering
export const LendingRow: React.FC<{
  lend: Lending & { relended: boolean };
  checkBoxChangeWrapped: (nft: Nft) => () => void;
  checked: boolean;
  hasRenting: boolean;
  openClaimModal: (t: boolean) => void;
  openLendModal: (t: boolean) => void;
}> = ({
  lend,
  checkBoxChangeWrapped,
  checked,
  hasRenting,
  openLendModal,
  openClaimModal
}) => {
  const lending = lend.lending;
  const blockTimeStamp = useContext(TimestampContext);
  const claimable = useMemo(
    () =>
      !!(
        lend.renting &&
        isClaimable(lend.renting, blockTimeStamp) &&
        !lend.lending.collateralClaimed
      ),
    [lend, blockTimeStamp]
  );

  const handleClaim = useCallback(() => {
    if (!claimable) return;
    checkBoxChangeWrapped(lend)();
    openClaimModal(true);
  }, [claimable, checkBoxChangeWrapped, lend, openClaimModal]);

  const handleClickLend = useCallback(() => {
    checkBoxChangeWrapped(lend)();
    openLendModal(true);
  }, [checkBoxChangeWrapped, lend, openLendModal]);

  const onRowClick = useCallback(() => {
    if (hasRenting && !claimable) return;
    checkBoxChangeWrapped(lend)();
  }, [checkBoxChangeWrapped, lend, hasRenting, claimable]);
  const claimTooltip = claimable
    ? "The NFT renting period is over. Click to claim your collateral."
    : hasRenting
    ? lend.lending.collateralClaimed
      ? "The item is already claimed"
      : "The item rental is not expired yet."
    : "No one rented the item as so far.";
  const lendTooltip = hasRenting
    ? "The item is rented out. You have to wait until the renter returns the item."
    : "Click to stop lending this item.";
  return (
    <Tr onClick={onRowClick}>
      <Td className="action-column">
        <Checkbox
          handleClick={checkBoxChangeWrapped(lend)}
          checked={checked}
          disabled={hasRenting && !claimable}
        />
      </Td>
      <Td className="column">
        <ShortenPopover longString={lending.nftAddress}></ShortenPopover>
      </Td>
      <Td className="column">{lend.tokenId}</Td>
      <Td className="column">{lend.amount}</Td>
      <Td className="column">{PaymentToken[lending.paymentToken ?? 0]}</Td>
      <Td className="column">{lending.nftPrice * Number(lend.amount)}</Td>
      <Td className="column">{lending.dailyRentPrice}</Td>
      <Td className="column">{lending.maxRentDuration} days</Td>
      <Td className="column">{lend.relended ? "renter" : "owner"}</Td>
      <Td className="action-column">
        <Tooltip title={claimTooltip} aria-label={claimTooltip}>
          <span>
            <Button
              handleClick={handleClaim}
              disabled={checked || !claimable}
              description="Claim"
            />
          </span>
        </Tooltip>
      </Td>
      <Td className="action-column">
        <Tooltip title={lendTooltip} aria-label={lendTooltip}>
          <span>
            <Button
              handleClick={handleClickLend}
              disabled={checked || hasRenting}
              description="Stop lend"
            />
          </span>
        </Tooltip>
      </Td>
    </Tr>
  );
};

export default React.memo(Dashboard);
