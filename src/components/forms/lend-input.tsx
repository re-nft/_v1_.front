import React, { useMemo } from "react";
import ModalFields from "../modals/modal-fields";
import { FormikErrors, FormikTouched } from "formik";
import { TokenSelect } from "../common/token-select";
import { LendInputProps } from "./lend-form";
import { TextField } from "../common/text-field";
import { CatalogueItemRow } from "../catalogue-item/catalogue-item-row";

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
}
export const LendInput: React.FC<ILendInput> = (input: ILendInput) => {
  const {
    lendingInput,
    index,
    handleChange,
    handleBlur,
    errors,
    touched,
    disabled,
  } = input;
  const only1Item = useMemo(() => {
    return lendingInput.amount === "1";
  }, [lendingInput.amount]);
  return (
    <div className="modal-dialog-section" key={lendingInput.key}>
      <ModalFields nft={lendingInput.nft}>
        {/* lendAmount for 721 is ignored */}
        <CatalogueItemRow text="Available Amount" value={lendingInput.amount} />
        <TextField
          required
          label="Amount"
          value={lendingInput.lendAmount ?? ""}
          //inputProps={{ inputMode: "numeric", pattern: "^[1-9][0-9]*$" }}
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
          //inputProps={{ inputMode: "numeric", pattern: "^[0-9]{0,3}$" }}
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
          // inputProps={{
          //   inputMode: "numeric",
          //   pattern: "^([1-9][0-9]{0,3})|([0-9]{1,4}(\\.[0-9]{0,3}[1-9]))$",
          // }}
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
          // inputProps={{
          //   inputMode: "numeric",
          //   pattern: "^([1-9][0-9]{0,3})|([0-9]{1,4}(\\.[0-9]{0,3}[1-9]))$",
          // }}
          onChange={handleChange}
          onBlur={handleBlur}
          id={`inputs.${index}.nftPrice`}
          name={`inputs.${index}.nftPrice`}
          error={
            !!touched && touched.nftPrice && Boolean(errors && errors.nftPrice)
          }
          helperText={touched && touched.nftPrice && errors && errors.nftPrice}
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
  );
};
