import React, { useState, useCallback, useContext, useMemo } from "react";
import moment from "moment";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import { Lending, Nft, Renting } from "../contexts/graph/classes";
import {
  getUniqueCheckboxId,
  isClaimable,
  useBatchItems,
} from "../controller/batch-controller";
import CatalogueLoader from "../components/catalogue-loader";
import { PaymentToken } from "../types";
import { nftReturnIsExpired, normalizeFloatTo4Decimals, short } from "../utils";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import { UserLendingContext } from "../contexts/UserLending";
import { UserRentingContext } from "../contexts/UserRenting";
import MultipleBatchBar from "../components/multiple-batch-bar";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { ShortenPopover } from "../components/shorten-popover";
import Checkbox from "../components/checkbox";
import { TimestampContext } from "../contexts/TimestampProvider";
import { Button } from "../components/button";
import UserContext from "../contexts/UserProvider";
import { CountDown } from "../components/countdown";
import ReturnModal from "../modals/return-modal";
import StopLendModal from "../modals/stop-lend-modal";
import ClaimModal from "../modals/claim-modal";

enum DashboardViewType {
  LIST_VIEW,
  MINIATURE_VIEW,
}

export const Dashboard: React.FC = () => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const { signer } = useContext(UserContext);
  const [isClaimModalOpen, toggleClaimModal] = useState(false);
  const [isLendModalOpen, toggleLendModal] = useState(false);
  const [isReturnModalOpen, toggleReturnModal] = useState(false);

  const {
    onCheckboxChange,
    handleResetLending,
    handleResetRenting,
    checkedItems,
    checkedLendingItems,
    checkedRentingItems,
    checkedClaims,
  } = useBatchItems();
  const { userRenting: rentingItems, isLoading: userRentingLoading } =
    useContext(UserRentingContext);
  const { userLending: lendingItems, isLoading: userLendingLoading } =
    useContext(UserLendingContext);
  const [viewType, _] = useState<DashboardViewType>(
    DashboardViewType.LIST_VIEW
  );

  const isLoading = userLendingLoading || userRentingLoading;

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

  if (!signer) {
    return <div className="center">Please connect your wallet!</div>;
  }

  if (isLoading && lendingItems.length === 0 && rentingItems.length === 0)
    return <CatalogueLoader />;

  if (!isLoading && lendingItems.length === 0 && rentingItems.length === 0) {
    return (
      <div className="center">
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
          {lendingItems.length !== 0 && (
            <div className="dashboard-section">
              <h2 className="lending">Lending</h2>
              <h3 style={{ color: "white", marginBottom: "1em" }}>
                Here you will find The NFTs That you are lending. These can also
                be found in The Lending tab after you toggle The view.
              </h3>
              <Table className="list">
                <Thead>
                  <Tr>
                    <Th style={{ widTh: "15%" }}>Address</Th>
                    <Th style={{ widTh: "7%" }}>ID</Th>
                    <Th style={{ widTh: "5%" }}>Amount</Th>
                    <Th style={{ widTh: "5%" }}>$</Th>
                    <Th style={{ widTh: "11%" }}>Collateral</Th>
                    <Th style={{ widTh: "7%" }}>Daily Price</Th>
                    <Th style={{ widTh: "7%" }}>Duration</Th>
                    <Th style={{ widTh: "7%" }}>Batch Select</Th>
                    <Th style={{ widTh: "10%" }} className="action-column">
                      &nbsp;
                    </Th>
                    <Th style={{ widTh: "10%" }} className="action-column">
                      &nbsp;
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {lendingItems.map((lend: Lending) => {
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
                  })}
                </Tbody>
              </Table>
            </div>
          )}
          {rentingItems.length !== 0 && (
            <div className="dashboard-section">
              <h2 className="renting">Renting</h2>
              <h3 style={{ color: "white", marginBottom: "1em" }}>
                Here you will find The NFTs That you are renting. These can also
                be found in The renting tab, after you toggle The view.
              </h3>
              <Table className="list">
                <Thead>
                  <Tr>
                    <Th style={{ widTh: "15%" }}>Address</Th>
                    <Th style={{ widTh: "5%" }}>ID</Th>
                    <Th style={{ widTh: "5%" }}>Amount</Th>
                    <Th style={{ widTh: "7%" }}>$</Th>
                    <Th style={{ widTh: "7%" }}>Collateral</Th>
                    <Th style={{ widTh: "11%" }}>Rented On</Th>
                    <Th style={{ widTh: "7%" }}>Duration</Th>
                    <Th style={{ widTh: "7%" }}>Due Date</Th>
                    <Th style={{ widTh: "7%" }}>Daily Price</Th>
                    <Th style={{ widTh: "7%" }}>Batch Select</Th>
                    <Th style={{ widTh: "20%" }} className="action-column">
                      &nbsp;
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {rentingItems.map((rent: Renting) => {
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
                  })}
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
  rent: Renting;
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
  openModal,
}) => {
  const renting = rent.renting;
  const handleClick = useCallback(() => {
    checkBoxChangeWrapped(rent)();
    openModal(true);
  }, [checkBoxChangeWrapped, openModal, rent]);
  const days = renting.rentDuration;

  const expireDate = moment(Number(renting.rentedAt) * 1000).add(
    renting.rentDuration,
    "day"
  );
  return (
    <Tr>
      <Td className="column">{short(renting.lending.nftAddress)}</Td>
      <Td className="column">{rent.tokenId}</Td>
      <Td className="column">{renting.lending.lentAmount}</Td>
      <Td className="column">
        {PaymentToken[renting.lending.paymentToken ?? 0]}
      </Td>
      <Td className="column">
        {normalizeFloatTo4Decimals(renting.lending.nftPrice * Number(renting.lending.lentAmount))}
      </Td>

      <Td className="column">
        {moment(Number(renting.rentedAt) * 1000).format("MM/D/YY hh:mm")}
      </Td>
      <Td className="column">
        {days} {days > 1 ? "days" : "day"}
      </Td>
      <Td className="column">
        <CountDown endTime={expireDate.toDate().getTime()} />
      </Td>
      <Td className="column">{renting.lending.dailyRentPrice}</Td>
      <Td className="action-column">
        <Checkbox
          handleClick={checkBoxChangeWrapped(rent)}
          checked={checked}
          disabled={isExpired}
        />
      </Td>
      <Td className="action-column">
        {renting.lending.lenderAddress !== currentAddress.toLowerCase() && (
          <Button
            handleClick={handleClick}
            disabled={checked || isExpired}
            description="Return it"
          />
        )}
      </Td>
    </Tr>
  );
};

// this keeps rerendering
export const LendingRow: React.FC<{
  lend: Lending;
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
  openClaimModal,
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
    checkBoxChangeWrapped(lend)()
    openClaimModal(true);
  }, [claimable, checkBoxChangeWrapped, lend, openClaimModal]);

  const handleClickLend = useCallback(() => {
    checkBoxChangeWrapped(lend)()
    openLendModal(true);
  }, [checkBoxChangeWrapped, lend, openLendModal]);
  return (
    <Tr>
      <Td className="column">
        <ShortenPopover longString={lending.nftAddress}></ShortenPopover>
      </Td>
      <Td className="column">{lend.tokenId}</Td>
      <Td className="column">{lend.amount}</Td>
      <Td className="column">{PaymentToken[lending.paymentToken ?? 0]}</Td>
      <Td className="column">{normalizeFloatTo4Decimals(lending.nftPrice * Number(lend.amount))}</Td>
      <Td className="column">{lending.dailyRentPrice}</Td>
      <Td className="column">{lending.maxRentDuration} days</Td>
      <Td className="action-column">
        <Checkbox
          handleClick={checkBoxChangeWrapped(lend)}
          checked={checked}
          disabled={hasRenting && !claimable}
        />
      </Td>
      <Td className="action-column">
        <Button
          handleClick={handleClaim}
          disabled={checked || !claimable}
          description="Claim"
        />
      </Td>
      <Td className="action-column">
        <Button
          handleClick={handleClickLend}
          disabled={checked || hasRenting}
          description="Stop lend"
        />
      </Td>
    </Tr>
  );
};

export default React.memo(Dashboard);
