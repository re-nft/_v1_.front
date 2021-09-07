import React, { Ref, useCallback, useMemo } from "react";
import ModalFields from "../../modals/modal-fields";
import { FormikErrors, FormikTouched } from "formik";
import { TokenSelect } from "../../common/token-select";
import { TextField } from "../../common/text-field";
import { CatalogueItemRow } from "../../catalogue-item/catalogue-item-row";
import { useNftMetaState } from "../../../hooks/queries/useMetaState";
import shallow from "zustand/shallow";
import { CatalogueItemDisplay } from "../../catalogue-item/catalogue-item-display";
import XIcon from "@heroicons/react/outline/XIcon";
import { LendInputProps } from "./lend-types";

const voidFn = () => {
  // do nothing func
};

interface ILendInput {
  lendingInput: LendInputProps;
  handleBlur: {
    (e: React.FocusEvent<unknown>): void;
    <T = unknown>(fieldOrEvent: T): T extends string
      ? (e: unknown) => void
      : void;
  };
  handleChange: {
    (e: React.ChangeEvent<unknown>): void;
    <T = string | React.ChangeEvent<unknown>>(
      field: T
    ): T extends React.ChangeEvent<unknown>
      ? void
      : (e: string | React.ChangeEvent<unknown>) => void;
  };
  index: number;
  touched: FormikTouched<LendInputProps> | null;
  errors: FormikErrors<LendInputProps> | null;
  disabled: boolean;
  removeFromCart: (index: number) => void;
}

export const LendItem: React.FC<ILendInput> = React.forwardRef(
  (input: ILendInput, ref) => {
    const {
      lendingInput,
      index,
      handleChange,
      handleBlur,
      removeFromCart,
      errors,
      touched,
      disabled,
    } = input;
    const only1Item = useMemo(() => {
      return lendingInput.amount === "1";
    }, [lendingInput.amount]);

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
        key={lendingInput.key}
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
              value={lendingInput.lendAmount ?? ""}
              onChange={only1Item ? voidFn : handleChange}
              onBlur={only1Item ? voidFn : handleBlur}
              id={`inputs.${index}.lendAmount`}
              name={`inputs.${index}.lendAmount`}
              disabled={only1Item || disabled}
              error={
                !!touched &&
                touched.lendAmount &&
                Boolean(errors && errors.lendAmount)
              }
              helperText={
                touched && touched.lendAmount && errors && errors.lendAmount
              }
            />

            <TextField
              required
              label="Max lend duration"
              value={lendingInput?.maxDuration ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              id={`inputs.${index}.maxDuration`}
              name={`inputs.${index}.maxDuration`}
              error={
                !!touched &&
                touched.maxDuration &&
                Boolean(errors && errors.maxDuration)
              }
              helperText={
                touched && touched.maxDuration && errors && errors.maxDuration
              }
              disabled={disabled}
            />
            <TextField
              required
              label="Borrow Price"
              value={lendingInput.borrowPrice ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              id={`inputs.${index}.borrowPrice`}
              name={`inputs.${index}.borrowPrice`}
              error={
                !!touched &&
                touched.borrowPrice &&
                Boolean(errors && errors.borrowPrice)
              }
              helperText={
                touched && touched.borrowPrice && errors && errors.borrowPrice
              }
              disabled={disabled}
            />
            <TextField
              required
              label="Collateral"
              value={lendingInput.nftPrice ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              id={`inputs.${index}.nftPrice`}
              name={`inputs.${index}.nftPrice`}
              error={
                !!touched &&
                touched.nftPrice &&
                Boolean(errors && errors.nftPrice)
              }
              helperText={
                touched && touched.nftPrice && errors && errors.nftPrice
              }
              disabled={disabled}
            />
            <TokenSelect
              refName={`inputs.${index}.pmToken`}
              handleChange={handleChange}
              selectedValue={lendingInput.pmToken ?? -1}
              disabled={disabled}
            />
          </ModalFields>
        </div>
      </li>
    );
  }
);

LendItem.displayName = "LendItem";
