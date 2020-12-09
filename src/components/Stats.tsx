import React, { useContext, useCallback } from "react";
import { Box } from "@material-ui/core";
import moment from "moment";

import Table from "./Table";
import GraphContext from "../contexts/Graph";
import { short } from "../utils";
import { PaymentToken, Lending } from "../types";
import ContractsContext from "../contexts/Contracts";

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
  const { rent } = useContext(ContractsContext);

  const handleClaim = useCallback(async () => {
    await rent.claimCollateralOne(
      lending.nftAddress,
      String(lending.tokenId),
      String(lending.id)
    );
  }, [lending, rent]);

  if (!lending.renting) return <span>❌</span>;

  const _now = moment();
  const _returnBy = returnBy(
    lending.renting.rentedAt,
    lending.renting.rentDuration
  );
  const _claim = _now.isAfter(_returnBy);

  return _claim ? <span onClick={handleClaim}>💰</span> : <span>❌</span>;
};

const Stats: React.FC<StatsProps> = ({ hidden }) => {
  // todo:
  // total earned
  // collateral claimed
  // # nfts lost

  const { user } = useContext(GraphContext);
  const { lending, renting } = user;

  if (hidden) return <></>;

  return (
    <Box
      style={{ display: "flex", flexDirection: "column", padding: "1.5rem 0" }}
    >
      <br />
      <div>------------------</div>
      <div>LENDING</div>
      <div>------------------</div>
      <Box style={{ padding: "1rem" }}>
        <Table>
          <TableHead tableType={TableType.LEND} />
          <tbody>
            {lending.length > 0 &&
              lending.map((l) => {
                console.log(l);
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

      <br />
      <div>------------------</div>
      <div>RENTING</div>
      <div>------------------</div>
      <Box style={{ padding: "1rem" }}>
        <Table>
          <TableHead tableType={TableType.BORROW} />
          <tbody>
            {renting.length > 0 &&
              renting.map((r) => (
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
