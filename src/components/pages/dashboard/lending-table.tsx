import React from "react";
import { Table, Thead, Tbody, Tr, Th } from "react-super-responsive-table";
import { Lending, Nft, Renting } from "../../../contexts/graph/classes";
import { UniqueID } from "../../../utils";
import { LendingRow } from "./dashboard-lending-row";

export interface ExtendedLending extends Lending {
  relended: boolean;
}

export const LendingTable: React.FC<{
  lendingItems: ExtendedLending[];
  checkedItems: Record<UniqueID, Nft | Lending | Renting>;
  toggleClaimModal: (b: boolean) => void;
  toggleLendModal: (b: boolean) => void;
  checkBoxChangeWrapped: (nft: Nft) => () => void;
}> = ({
  lendingItems,
  toggleClaimModal,
  toggleLendModal,
  checkBoxChangeWrapped,
  checkedItems
}) => {
  return lendingItems.length !== 0 ? (
    <div className="dashboard-section">
      <h2 className="dashboard-header dashboard-header__lending"></h2>
      <h3 style={{ color: "white", marginBottom: "1em" }}>
        Here you will find The NFTs That you are lending. These can also be
        found in The Lending tab after you toggle The view.
      </h3>
      <Table className="list">
        <Thead>
          <Tr>
            <Th style={{ widTh: "7%" }}>Batch Select</Th>

            <Th style={{ widTh: "15%" }}>Address</Th>
            <Th style={{ widTh: "7%" }}>ID</Th>
            <Th style={{ widTh: "5%" }}>Amount</Th>
            <Th style={{ widTh: "5%" }}>$</Th>
            <Th style={{ widTh: "7%" }}>Daily Price</Th>
            <Th style={{ widTh: "7%" }}>Duration</Th>
            <Th style={{ widTh: "10%" }} className="action-column">
              &nbsp;
            </Th>
            <Th style={{ widTh: "10%" }} className="action-column">
              &nbsp;
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {lendingItems.map((lend) => {
            const id = lend.id;
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
  ) : null;
};
