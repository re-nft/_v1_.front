import React, { Ref, useCallback, useMemo } from "react";
import XIcon from "@heroicons/react/outline/XIcon";
import shallow from "zustand/shallow";

import ModalFields from "renft-front/components/modals/modal-fields";
import { TextField } from "renft-front/components/common/text-field";
import { CatalogueItemRow } from "renft-front/components/catalogue-item/catalogue-item-row";
import { useNftMetaState } from "renft-front/hooks/store/useMetaState";
import { CatalogueItemDisplay } from "renft-front/components/catalogue-item/catalogue-item-display";
import { TokenSelect } from "renft-front/components/common/token-select";
import { useRegisterFields } from "renft-front/hooks/misc/useRegisterFields";

import type { ILendInput } from "./lend-types";

export const LendItem: React.FC<ILendInput> = React.forwardRef(
  (input: ILendInput, ref) => {
    const {
      lendingInput,
      index,
      removeFromCart,
      disabled,
      register,
      formState
    } = input;
    const only1Item = useMemo(() => {
      return lendingInput.amount === "1";
    }, [lendingInput.amount]);
    const registerFields = useRegisterFields(register, formState, index);

    const meta = useNftMetaState(
      useCallback(
        (state) => {
          return state.metas[lendingInput.nft.nId] || {};
        },
        [lendingInput.nft.nId]
      ),
      shallow
    );
    const removeItem = useCallback(() => {
      removeFromCart(index);
    }, [index, removeFromCart]);
    return (
      <li
        ref={ref as Ref<HTMLLIElement>}
        key={lendingInput.nft.id}
        className="flex flex-col py-2 relative border border-black "
      >
        <div className="w-40 h-40 px-2">
          <CatalogueItemDisplay
            image={meta.image}
            description={meta.description}
          />
        </div>
        <div className="absolute -top-2 -right-2 bg-white p-4">
          <div className="ml-4">
            <button
              type="button"
              className="text-sm font-medium text-black"
              onClick={removeItem}
            >
              <XIcon className="h-8 w-8 text-black" />
            </button>
          </div>
        </div>
        <div className="flex-1">
          <ModalFields nft={lendingInput.nft}>
            {/* lendAmount for 721 is ignored */}
            <CatalogueItemRow
              text="Available Amount"
              value={lendingInput.amount}
            />
            <TextField
              required
              label="Amount"
              disabled={only1Item || disabled}
              value={only1Item ? "1" : lendingInput.lendAmount ?? ""}
              {...registerFields("lendAmount")}
            />

            <TextField
              required
              label="Max lend duration"
              disabled={disabled}
              value={lendingInput?.maxDuration ?? ""}
              {...registerFields("maxDuration")}
            />
            <TextField
              required
              label="Borrow Price"
              disabled={disabled}
              value={lendingInput.borrowPrice ?? ""}
              {...registerFields("borrowPrice")}
            />

            <TextField
              required
              label="Collateral"
              disabled={disabled}
              value={lendingInput.nftPrice ?? ""}
              {...registerFields("nftPrice")}
            />

            <TokenSelect
              selectedValue={lendingInput.pmToken ?? -1}
              disabled={disabled}
              {...registerFields("pmToken")}
            />
          </ModalFields>
        </div>
      </li>
    );
  }
);

LendItem.displayName = "LendItem";
