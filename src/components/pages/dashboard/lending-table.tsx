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
    <div className=" px-8">
      <h2>
        <span sr-only="Lending"></span>
        <img src="/assets/Lending-headline.svg" className="h-12" />
      </h2>
      <h3 className="text-lg">
        Here you will find he NFTs that you are lending. These can also be found
        in the Lending tab after you toggle the view.
      </h3>
      <div className="flex flex-col py-4 pt-8">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="align-middle inline-block min-w-full">
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
                      className="px-1 pb-2 text-left text-xl leading-3 font-normal  tracking-wider"
                    >
                      NFT Address
                    </th>
                    <th
                      scope="col"
                      className="px-1 pb-2 text-left text-xl leading-3 font-normal   tracking-wider"
                    >
                      TokenId
                    </th>
                    <th
                      scope="col"
                      className="px-1 pb-2 text-left text-xl leading-3 font-normal  tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-1 pb-2 text-left text-xl leading-3 font-normal   tracking-wider"
                    >
                      ERC20 Payment
                    </th>
                    <th
                      scope="col"
                      className="px-1 pb-2 text-left text-xl leading-3 font-normal   tracking-wider"
                    >
                      Duration
                    </th>

                    <th
                      scope="col"
                      className="px-1 pb-2 text-left text-xl leading-3 font-normal   tracking-wider"
                    >
                      Collateral
                    </th>
                    <th
                      scope="col"
                      className="px-1 pb-2 text-left text-xl leading-3 font-normal   tracking-wider"
                    >
                      Daily Price
                    </th>
                    <th
                      scope="col"
                      className="px-1 pb-2 text-left text-xl leading-3 font-normal  tracking-wider"
                    >
                      Original owner
                    </th>
                    <th
                      scope="col"
                      className="px-1 pb-2 text-left text-xl leading-3 font-normal  tracking-wider"
                    >
                      Defaulted
                    </th>

                    <th
                      scope="col"
                      className="px-2 pb-2 text-left text-xl leading-3 font-normal  uppercase tracking-wider"
                    >
                      Batch Select
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
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
