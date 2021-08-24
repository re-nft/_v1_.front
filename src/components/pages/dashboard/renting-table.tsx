import { Lending, Nft, Renting } from "../../../contexts/graph/classes";
import React from "react";
import { RentingRow } from "./dashboard-renting-row";
import { nftReturnIsExpired, UniqueID } from "../../../utils";

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
  currentAddress,
}) => {
  return rentingItems.length !== 0 ? (
    <div className="py-4 px-8">
      <h2 className="">
        <span sr-only="Renting"></span>
        <img src="/assets/Renting-headline.svg" className="h-12" />
      </h2>

      <h3>
        Here you will find The NFTs That you are renting. These can also be
        found in The renting tab, after you toggle The view.
      </h3>
      <div className="flex flex-col py-4">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="overflow-hidden border-2 border-white">
              <table className="min-w-full divide-y divide-white">
                <thead>
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
                      className="px-6 py-3 text-left text-sm font-medium  uppercase tracking-wider"
                    >
                      Rented On
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium  uppercase tracking-wider"
                    >
                      Due Date
                    </th>

                    <th>&nbsp;</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white">
                  {rentingItems.map((rent: Renting & { relended: boolean }) => {
                    const checked = !!checkedItems[rent.id];
                    const isExpired = nftReturnIsExpired(rent);
                    return (
                      <RentingRow
                        checked={checked}
                        rent={rent}
                        key={rent.id}
                        openModal={toggleReturnModal}
                        currentAddress={currentAddress}
                        checkBoxChangeWrapped={checkBoxChangeWrapped}
                        isExpired={isExpired}
                      ></RentingRow>
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
