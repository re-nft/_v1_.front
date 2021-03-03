import React, { useContext, useCallback } from "react";
import { Box } from "@material-ui/core";
import moment from "moment";

import Table from "./Table";
import { ERCNft } from "../contexts/Graph/types";
import { short } from "../utils";
import { PaymentToken } from "../types";
import { RentNftContext } from "../hardhat/SymfoniContext";

type StatsProps = {
  hidden: boolean;
};

enum TableType {
  BORROW,
  LEND,
}

type TableHeadProps = {
  tableType: TableType;
};

const returnBy = (rentedAt: number, rentDuration: number) => {
  return moment.unix(rentedAt).add(rentDuration, "days");
};

const TableHead: React.FC<TableHeadProps> = ({ tableType }) => {
  return (
    <thead>
      <tr>
        <th>NFT Addr</th>
        <th>Token</th>
        <th>ID</th>
        <th>Rate</th>
        <th>Collateral</th>
        {tableType === TableType.LEND && <th>Max Duration</th>}
        {tableType === TableType.BORROW && <th>Return by</th>}
        {tableType === TableType.LEND && <th>Claim</th>}
      </tr>
    </thead>
  );
};

type TableRowProps = {
  address: string;
  tokenId: string;
  id: string;
  dailyPrice: string;
  collateral: string;
  maxDuration: string;
  claim?: React.ReactNode;
  greenHighlight?: boolean;
};

type ClaimButtonProps = {
  lending: ERCNft;
};

const TableRow: React.FC<TableRowProps> = ({
  address,
  tokenId,
  id,
  dailyPrice,
  collateral,
  maxDuration,
  claim,
  greenHighlight,
}) => {
  const _greenHighlight = {
    backgroundColor: "rgba(102,51,153,0.4)",
  };

  return (
    <tr>
      <td style={greenHighlight ? _greenHighlight : {}}>{short(address)}</td>
      <td style={greenHighlight ? _greenHighlight : {}}>{tokenId}</td>
      <td style={greenHighlight ? _greenHighlight : {}}>{id}</td>
      <td style={greenHighlight ? _greenHighlight : {}}>{dailyPrice}</td>
      <td style={greenHighlight ? _greenHighlight : {}}>{collateral}</td>
      <td style={greenHighlight ? _greenHighlight : {}}>{maxDuration}</td>
      <td
        style={greenHighlight ? { ..._greenHighlight, cursor: "pointer" } : {}}
      >
        {claim}
      </td>
    </tr>
  );
};

const ClaimButton: React.FC<ClaimButtonProps> = ({ lending }) => {
  const { instance: renft } = useContext(RentNftContext);

  const handleClaim = useCallback(async () => {
    if (!renft) return;

    await renft
      .claimCollateral(
        [lending.address],
        [lending.tokenId],
        // @ts-ignore
        [lending.lending?.[-1]]
      )
      .catch(() => false);
  }, [renft, lending]);

  const handleStopLend = useCallback(async () => {
    if (!renft) return;

    await renft.stopLending(
      [lending.address],
      [lending.tokenId],
      // @ts-ignore
      [lending.lending?.[-1]]
    );
  }, [renft, lending]);

  if (!lending.renting) {
    return <span onClick={handleStopLend}>❌</span>;
  }

  const _now = moment();
  const _returnBy = returnBy(
    // @ts-ignore
    lending.renting?.rentedAt,
    // @ts-ignore
    lending.renting?.rentDuration
  );
  const _claim = _now.isAfter(_returnBy);

  return _claim ? (
    <span onClick={handleClaim}>💰</span>
  ) : (
    <span onClick={handleStopLend}>❌</span>
  );
};

const Stats: React.FC<StatsProps> = ({ hidden }) => {
  // TODO
  const lending: ERCNft[] = [];
  const renting: ERCNft[] = [];

  if (hidden) return <></>;

  return (
    <Box
      style={{ display: "flex", flexDirection: "column", padding: "1.5rem 0" }}
    >
      <Box style={{ padding: "1rem" }}>
        <h2>Lending</h2>
        <Table>
          <TableHead tableType={TableType.LEND} />
          <tbody>
            {lending.length > 0 &&
              lending.map((l) => {
                return (
                  <TableRow
                    key="deal wiv it"
                    // key={`${l.address}::${l.tokenId}::${l.lending?.[0].id}`}
                    address={l.address}
                    tokenId={String(l.tokenId)}
                    // id={String(l.lending?.[0].id)}
                    id="0"
                    // dailyPrice={`${
                    //   PaymentToken[l.lending?.[0].paymentToken ?? 0]
                    // } ${String(l.lending?.[0].dailyRentPrice)}`}
                    // collateral={`${
                    //   PaymentToken[l.lending?.[0].paymentToken ?? 0]
                    // } ${String(l.lending?.[0].nftPrice)}`}
                    // maxDuration={String(l.lending?.[0].maxRentDuration)}
                    dailyPrice="1"
                    collateral="1"
                    maxDuration="1"
                    claim={<ClaimButton lending={l} />}
                    greenHighlight={Boolean(l.renting)}
                  />
                );
              })}
          </tbody>
        </Table>
      </Box>
      <Box style={{ padding: "1rem" }}>
        <h2>Renting</h2>
        <Table>
          <TableHead tableType={TableType.BORROW} />
          <tbody>
            {renting.length > 0 &&
              renting.map((r) => (
                <TableRow
                  // key={`${r.address}::${r.tokenId}::${r.renting?.[0].id}`}
                  key="deal wiv it"
                  address={r.address}
                  tokenId={String(r.tokenId)}
                  id="1"
                  dailyPrice="1"
                  collateral="1"
                  maxDuration="1"
                  // id={String(r.renting?.[0].id)}
                  // dailyPrice={`${
                  //   PaymentToken[r.lending?.[0].paymentToken ?? 0]
                  // } ${String(r.lending?.[0].dailyRentPrice)}`}
                  // collateral={`${
                  //   PaymentToken[r.lending?.[0].paymentToken ?? 0]
                  // } ${String(r.lending?.[0].nftPrice)}`}
                  // maxDuration={String(
                  //   returnBy(
                  //     r.renting?.[0].rentedAt ?? 0,
                  //     r.renting?.[0].rentDuration ?? 0
                  //   )
                  // )}
                />
              ))}
          </tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default Stats;
