import React from "react";
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
  checkedItems,
}) => {
  return lendingItems.length !== 0 ? (
    <div className="py-4 px-8">
      <h2 className="">
        <span sr-only="Lending"></span>
        <img src="/assets/Lending-headline.svg" className="h-12" />
      </h2>
      <h3>
        Here you will find he NFTs that you are lending. These can also be found
        in the Lending tab after you toggle the view.
      </h3>
      <div className="flex flex-col py-4">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="overflow-hidden border-2 border-white">
              <table className="min-w-full divide-y divide-white">
                <thead className="text-lg leading-loose text-left">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium  uppercase tracking-wider"
                    >
                      Batch Select
                    </th>

                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium  uppercase tracking-wider"
                    >
                      Address
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium  uppercase tracking-wider"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium  uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium  uppercase tracking-wider"
                    >
                      $
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium  uppercase tracking-wider"
                    >
                      Collateral
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium  uppercase tracking-wider"
                    >
                      Daily Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium  uppercase tracking-wider"
                    >
                      Duration
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider"
                    >
                      Original owner
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium  uppercase tracking-wider"
                    >
                      &nbsp;
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                    >
                      &nbsp;
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white">
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
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
