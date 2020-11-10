import React from "react";
import { Box, Tooltip } from "@material-ui/core";

import Table from "./Table";

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
        <th>NFT Address</th>
        <th>Token id</th>
        <th>Daily borrow price</th>
        <th>Collateral</th>
        <th>Max Duration</th>
        <th>Actual Duration</th>
        <th>{tableType === TableType.BORROW ? "Paid" : "Earned"}</th>
      </tr>
    </thead>
  );
};

type TableRowProps = {
  address: string;
  tokenId: string;
  dailyPrice: string;
  collateral: string;
  maxDuration: string;
  actualDuration: string;
  amount: string;
};

const TableRow: React.FC<TableRowProps> = ({
  address,
  tokenId,
  dailyPrice,
  collateral,
  maxDuration,
  actualDuration,
  amount,
}) => {
  return (
    <tr>
      <td>{address}</td>
      <td>{tokenId}</td>
      <td>{dailyPrice}</td>
      <td>{collateral}</td>
      <td>{maxDuration}</td>
      <td>{actualDuration}</td>
      {/* TODO: tooltip will show what day this is */}
      <td>{amount}</td>
    </tr>
  );
};

const Stats: React.FC<StatsProps> = ({ hidden }) => {
  if (hidden) {
    return <></>;
  }

  return (
    <Box
      style={{ display: "flex", flexDirection: "column", padding: "1.5rem 0" }}
    >
      <div>Total earned from lending: $1222 (in rent prices)</div>
      <div># of NFTs currently lending: 2</div>
      <div># of NFTS currently renting: 1</div>
      <div>Earning: dynamic numbers</div>
      <div>Spending: dynamic numbers</div>
      <div>Net: dynamic numbers</div>

      <br />
      <div>------------------</div>
      <div>LENDING</div>
      <div>------------------</div>
      <Box style={{ padding: "1rem" }}>
        <Table>
          <TableHead tableType={TableType.LEND} />
          <tbody>
            <TableRow
              address="0xkjkj3k2423"
              tokenId="0x2"
              dailyPrice="$100"
              collateral="$1000"
              maxDuration="10"
              actualDuration="5"
              amount="$6.25/$10"
            />
            <TableRow
              address="0xkjkjffssx3"
              tokenId="0x3"
              dailyPrice="$121.2"
              collateral="$1200"
              maxDuration="12"
              actualDuration="4"
              amount="$6.25/$10"
            />
          </tbody>
        </Table>
      </Box>

      <br />
      <div>------------------</div>
      <div>BORROWING</div>
      <div>------------------</div>
      <Box style={{ padding: "1rem" }}>
        <Table>
          <TableHead tableType={TableType.BORROW} />
          <tbody>
            <TableRow
              address="0xkjkjffssx3"
              tokenId="0x3"
              dailyPrice="$121.2"
              collateral="$1200"
              maxDuration="12"
              actualDuration="4"
              amount="$6.25/$10"
            />
          </tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default Stats;
