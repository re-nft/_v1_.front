import React, { useContext, useCallback } from "react";
import { Box } from "@material-ui/core";
import moment from "moment";

import Table from "./Table";
import GraphContext from "../contexts/Graph";
import { short } from "../utils";
import { PaymentToken, Renting } from "../types";
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
        {tableType === TableType.BORROW && <th>Claim</th>}
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
};

type ClaimButtonProps = {
  claim: boolean;
  handleClaim: (rentgin: Renting) => void;
};

const TableRow: React.FC<TableRowProps> = ({
  address,
  tokenId,
  id,
  dailyPrice,
  collateral,
  maxDuration,
  claim,
}) => {
  return (
    <tr>
      <td>{short(address)}</td>
      <td>{tokenId}</td>
      <td>{id}</td>
      <td>{dailyPrice}</td>
      <td>{collateral}</td>
      <td>{maxDuration}</td>
      {claim && "Claim"}
    </tr>
  );
};

const ClaimButton: React.FC<ClaimButtonProps> = ({ claim, handleClaim }) => {
  const _handleClaim = useCallback(
    async (r: Renting) => {
      await handleClaim(r);
    },
    [handleClaim]
  );
  if (!claim) return <></>;
  return (
    claim && (
      <Box onClick={_handleClaim}>
        <button>Claim</button>
      </Box>
    )
  );
};

const Stats: React.FC<StatsProps> = ({ hidden }) => {
  // todo:
  // total earned
  // collateral claimed
  // # nfts lost

  const { user } = useContext(GraphContext);
  const { rent } = useContext(ContractsContext);
  const { lending, renting } = user;

  const handleClaim = useCallback(
    async (r: Renting) => {
      await rent.claimCollateralOne(
        r.lending.nftAddress,
        String(r.lending.tokenId),
        String(r.lending.id)
      );
    },
    [rent]
  );

  const returnBy = (rentedAt: number, rentDuration: number) => {
    return moment.unix(rentedAt).add(rentDuration, "days");
  };

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
              lending.map((l) => (
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
                />
              ))}
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
              renting.map((r) => {
                const _returnBy = returnBy(r.rentedAt, r.rentDuration);
                const _now = moment();
                // const _claim = _now.isAfter(_returnBy);
                const _claim = true;
                return (
                  <TableRow
                    key={`${r.lending.nftAddress}::${r.lending.tokenId}::${r.lending.id}`}
                    address={r.lending.nftAddress}
                    tokenId={String(r.lending.tokenId)}
                    id={String(r.lending.id)}
                    dailyPrice={`${
                      PaymentToken[r.lending.paymentToken]
                    } ${String(r.lending.dailyRentPrice)}`}
                    collateral={`${
                      PaymentToken[r.lending.paymentToken]
                    } ${String(r.lending.nftPrice)}`}
                    maxDuration={String(_returnBy)}
                    claim={
                      <ClaimButton claim={_claim} handleClaim={handleClaim} />
                    }
                  />
                );
              })}
          </tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default Stats;
