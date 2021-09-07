import { Lending, Nft, Renting } from "../../../types/classes";
import React from "react";
import { RentingRow } from "./dashboard-renting-row";
import { nftReturnIsExpired, UniqueID } from "../../../utils";

export interface ExtendedRenting extends Renting {
  relended: boolean;
}

export const RentingTable: React.FC<{
  rentingItems: ExtendedRenting[];
  checkedItems: Record<UniqueID, Nft | Lending | Renting>;
  checkBoxChangeWrapped: (nft: Nft) => () => void;
  currentAddress: string;
}> = ({
  rentingItems,
  checkedItems,
  checkBoxChangeWrapped,
  currentAddress,
}) => {
  return rentingItems.length !== 0 ? (
    <div className="py-4 px-8">
      <h2 className="">
        <span sr-only="Renting"></span>
        <img src="/assets/Renting-headline.svg" className="h-12" />
      </h2>

      <h3 className="text-lg">
        Here you will find The NFTs That you are renting. These can also be
        found in The renting tab, after you toggle The view.
      </h3>
      <div className="flex flex-col py-4">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-white px-4">
                <thead className="text-lg leading-loose text-left mb-2 border-b-2 border-white">
                  <tr>
                    <th
                      scope="col"
                      className="pl-8 px-2 pb-2 text-left text-xl leading-3 font-normal  tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-1 pb-2 text-left text-xl leading-3 font-normal  tracking-wide"
                    >
                      NFT Address
                    </th>
                    <th
                      scope="col"
                      className="px-1 pb-2 text-left text-xl leading-3 font-normal  tracking-wide"
                    >
                      Token Id
                    </th>
                    <th
                      scope="col"
                      className="px-1 pb-2 text-left text-xl leading-3 font-normal  tracking-wide"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-1 pb-2 text-left text-xl leading-3 font-normal  tracking-wider"
                    >
                      ERC20 Payment
                    </th>
                    <th
                      scope="col"
                      className="px-1 pb-2 text-left text-xl leading-3 font-normal  tracking-wide"
                    >
                      Duration
                    </th>

                    <th
                      scope="col"
                      className="px-1 pb-2 text-left text-xl leading-3 font-normal  tracking-wide"
                    >
                      Collateral
                    </th>
                    <th
                      scope="col"
                      className="px-1 pb-2 text-left text-xl leading-3 font-normal  tracking-wider"
                    >
                      Daily Price
                    </th>
                    <th
                      scope="col"
                      className="px-1 pb-2 text-left text-xl leading-3 font-normal  tracking-wide"
                    >
                      Due Date
                    </th>
                    <th
                      scope="col"
                      className="px-1 pb-2 text-left text-xl leading-3 font-normal  tracking-wide"
                    >
                      Defaulted
                    </th>

                    <th
                      scope="col"
                      className="px-1 pb-2 text-left text-xl leading-3 font-normal  tracking-wide"
                    >
                      Batch Select
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {rentingItems.map((rent: Renting & { relended: boolean }) => {
                    const checked = !!checkedItems[rent.id];
                    const isExpired = nftReturnIsExpired(rent);
                    return (
                      <RentingRow
                        checked={checked}
                        rent={rent}
                        key={rent.id}
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
