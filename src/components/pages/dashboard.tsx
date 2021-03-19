import React, { useContext, useCallback } from "react";
import { Box } from "@material-ui/core";
import moment from "moment";

import Table from "../table";
import { Lending } from "../../contexts/graph/classes";
import { short } from "../../utils";
import { RentNftContext } from "../../hardhat/SymfoniContext";
import GraphContext from "../../contexts/graph";
import { PaymentToken } from "../../types";

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

const Stats: React.FC = () => {
  const { usersLending, usersRenting } = useContext(GraphContext);

  return (
    <Box
      style={{ display: "flex", flexDirection: "column", padding: "1.5rem 0" }}
    >
      <Box style={{ padding: "1rem" }}>
        <h2>Lending</h2>
        <Table>
          <TableHead tableType={TableType.LEND} />
          <tbody>
            {usersLending.length > 0 &&
              usersLending.map((l) => {
                return (
                  <TableRow
                    key={`${l.address}::${l.tokenId}::${l.lending.id}`}
                    address={l.address}
                    tokenId={String(l.tokenId)}
                    id={String(l.lending.id)}
                    dailyPrice={`${
                       PaymentToken[l.lending.paymentToken ?? 0]
                    } ${String(l.lending.dailyRentPrice)}`}
                    collateral={`${
                       PaymentToken[l.lending.paymentToken ?? 0]
                    } ${String(l.lending.nftPrice)}`}
                    maxDuration={String(l.lending.maxRentDuration)}
                    claim={<ClaimButton lending={l} />}
                    // todo
                    // greenHighlight={Boolean(l.renting)}
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
            {usersRenting.length > 0 &&
              usersRenting.map((r) => (
                <TableRow
                  key={`${r.address}::${r.tokenId}::${r.renting.id}`}
                  address={r.address}
                  tokenId={String(r.tokenId)}
                  id={String(r.renting.id)}
                  // dailyPrice={`${
                  //   PaymentToken[r.renting.paymentToken ?? 0]
                  // } ${String(r.lending.dailyRentPrice)}`}
                  // collateral={`${
                  //   PaymentToken[r.lending.paymentToken ?? 0]
                  // } ${String(r.lending.nftPrice)}`}
                  dailyPrice={"0"}
                  collateral={"0"}
                  maxDuration={String(
                    returnBy(
                      r.renting.rentedAt ?? 0,
                      r.renting.rentDuration ?? 0
                    )
                  )}
                />
              ))}
          </tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default Stats;
