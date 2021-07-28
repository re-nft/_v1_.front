import { Table, Thead, Tbody, Tr, Th } from "react-super-responsive-table";
import { Lending, Nft, Renting } from "../../../contexts/graph/classes";
import React from "react";
import { RentingRow } from "./dashboard-renting-row";
import {
  getUniqueCheckboxId,
  UniqueID
} from "../../../controller/batch-controller";
import { nftReturnIsExpired } from "../../../utils";

export interface ExtendedRenting extends Renting {
  relended: boolean;
}

export const RentingTable: React.FC<{
  rentingItems: ExtendedRenting[];
  checkedItems: Record<UniqueID, Nft | Lending | Renting>;
  toggleReturnModal: (b: boolean) => void;
  checkBoxChangeWrapped: (nft: Nft) => () => void;
  currentAddress: string;
}> = ({
  rentingItems,
  checkedItems,
  toggleReturnModal,
  checkBoxChangeWrapped,
  currentAddress
}) => {
  return rentingItems.length !== 0 ? (
    <div className="dashboard-section">
      <h2 className="dashboard-header dashboard-header__renting"></h2>
      <h3 style={{ color: "white", marginBottom: "1em" }}>
        Here you will find The NFTs That you are renting. These can also be
        found in The renting tab, after you toggle The view.
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
          {rentingItems.map((rent: Renting & { relended: boolean }) => {
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
  ) : null;
};
