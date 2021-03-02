import React, { useContext, useCallback } from "react";
import { Box } from "@material-ui/core";
import moment from "moment";

import Table from "./Table";
import GraphContext from "../contexts/Graph";
import { short } from "../utils";
import { PaymentToken } from "../types";
import { Lending, RentingAndLending } from "../types/graph";
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
        {/* <th>Preview</th> */}
        <th>NFT Addr</th>
        <th>Token</th>
        <th>ID</th>
        <th>Rate</th>
        <th>Collateral</th>
        {tableType === TableType.LEND && <th>Max Duration</th>}
        {/* <th>{tableType === TableType.BORROW ? "Paid" : "Earned"}</th> */}
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
  lending: Lending;
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

    await renft.claimCollateral(
      [lending.nftAddress],
      [lending.tokenId],
      [lending.id]
    );
  }, [renft]);

  const handleStopLend = useCallback(async () => {
    if (!renft) return;

    await renft.stopLending(
      [lending.nftAddress],
      [lending.tokenId],
      [lending.id]
    );
  }, [renft]);

  if (!lending.renting) {
    return <span onClick={handleStopLend}>❌</span>;
  };

  const _now = moment();
  const _returnBy = returnBy(
    // @ts-ignore
    lending.renting?.rentedAt,
    // @ts-ignore
    lending.renting?.rentDuration
  );
  const _claim = _now.isAfter(_returnBy);

  return _claim ? <span onClick={handleClaim}>💰</span> : <span onClick={handleStopLend}>❌</span>;
};

const Stats: React.FC<StatsProps> = ({ hidden }) => {
  const { user } = useContext(GraphContext);
  const { lendings, rentings } = user;

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
            {lendings.length > 0 &&
              lendings.map((l) => {
                return (
                  <TableRow
                    key={`${l.nftAddress}::${l.tokenId}::${l.id}`}
                    address={l.nftAddress}
                    tokenId={String(l.tokenId)}
                    id={String(l.id)}
                    dailyPrice={`${PaymentToken[l.paymentToken]} ${String(
                      l.dailyRentPrice
                    )}`}
                    collateral={`${PaymentToken[l.paymentToken]} ${String(
                      l.nftPrice
                    )}`}
                    maxDuration={String(l.maxRentDuration)}
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
            {rentings.length > 0 &&
              rentings.map((r: RentingAndLending) => (
                <TableRow
                  key={`${r.lending.nftAddress}::${r.lending.tokenId}::${r.lending.id}`}
                  address={r.lending.nftAddress}
                  tokenId={String(r.lending.tokenId)}
                  id={String(r.lending.id)}
                  dailyPrice={`${PaymentToken[r.lending.paymentToken]} ${String(
                    r.lending.dailyRentPrice
                  )}`}
                  collateral={`${PaymentToken[r.lending.paymentToken]} ${String(
                    r.lending.nftPrice
                  )}`}
                  maxDuration={String(returnBy(r.rentedAt, r.rentDuration))}
                />
              ))}
          </tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default Stats;
