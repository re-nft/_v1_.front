import React from "react";
import { Box, Tooltip } from "@material-ui/core";

import ProgressBar from "./Progressbar";
import Table from "./Table";

type StatsProps = {
  hidden: boolean;
};

const Stats: React.FC<StatsProps> = ({ hidden }) => {
  if (hidden) {
    return <></>;
  }

  return (
    <Box style={{ display: "flex", flexDirection: "column" }}>
      <div>Total earned from lending: $1222 (in rent prices)</div>
      <div># of NFTs currently lending: 3</div>
      <div># of NFTS currently renting: 1</div>
      <div>Earning: dynamic numbers</div>
      <div>Spending: dynamic numbers</div>

      <br />
      <div>------------------</div>
      <div>LENDING</div>
      <div>------------------</div>
      <Table>
        <thead>
          <tr>
            <th>Preview</th>
            <th>NFT Address</th>
            <th>Token id</th>
            <th>Daily borrow price</th>
            <th>Collateral</th>
            <th>Max Duration</th>
            <th>Actual Duration</th>
            <th>Earned</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>[]</td>
            <td>0xkjkj3k2423</td>
            <td>0x4</td>
            <td>$100</td>
            <td>$1000</td>
            <td>20</td>
            <td>10</td>
            {/* TODO: tooltip will show what day this is */}
            <td>$50/$100</td>
          </tr>
          <tr>
            <td>[]</td>
            <td>0xkjkj3k2423</td>
            <td>0x4</td>
            <td>$100</td>
            <td>$1000</td>
            <td>20</td>
            <td>10</td>
            {/* TODO: tooltip will show what day this is */}
            <td>$50/$100</td>
          </tr>
          <tr>
            <td>[]</td>
            <td>0xkjkj3k2423</td>
            <td>0x4</td>
            <td>$100</td>
            <td>$1000</td>
            <td>20</td>
            <td>-</td>
            {/* TODO: tooltip will show what day this is */}
            <td>-</td>
          </tr>
        </tbody>
      </Table>

      <br />
      <div>------------------</div>
      <div>BORROWING</div>
      <div>------------------</div>
      <Table />
      <thead>
        <tr>
          <th>Preview</th>
          <th>NFT Address</th>
          <th>Token id</th>
          <th>Daily borrow price</th>
          <th>Collateral</th>
          <th>Max Duration</th>
          <th>Actual Duration</th>
          <th>Earned</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>[]</td>
          <td>0xkjkj3k2423</td>
          <td>0x4</td>
          <td>$100</td>
          <td>$1000</td>
          <td>20</td>
          <td>10</td>
          {/* TODO: tooltip will show what day this is */}
          <td>$50/$100</td>
        </tr>
        <tr>
          <td>[]</td>
          <td>0xkjkj3k2423</td>
          <td>0x4</td>
          <td>$100</td>
          <td>$1000</td>
          <td>20</td>
          <td>10</td>
          {/* TODO: tooltip will show what day this is */}
          <td>$50/$100</td>
        </tr>
        <tr>
          <td>[]</td>
          <td>0xkjkj3k2423</td>
          <td>0x4</td>
          <td>$100</td>
          <td>$1000</td>
          <td>20</td>
          <td>-</td>
          {/* TODO: tooltip will show what day this is */}
          <td>-</td>
        </tr>
      </tbody>
    </Box>
  );
};

export default Stats;
