import React, { useMemo } from "react";
import CommonInfo from "../modals/common-info";
import { FormikErrors, FormikTouched } from "formik";
import MinimalSelect from "../components/common/select";
import { LendInputProps } from "./lend-form";
import CssTextField from "../components/common/css-text-field";

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
      <CommonInfo nft={lendingInput.nft}>
        {/* lendAmount for 721 is ignored */}
        <div className="modal-dialog-for">
          <div className="label">Available Amount</div>
          <div className="dot"></div>
          {/* we can do this because checked items will have the right amount when we pass them here */}
          <div className="label">{lendingInput.amount}</div>
        </div>
        <CssTextField
          required
          label="Amount"
          variant="outlined"
          value={lendingInput.lendAmount ?? ""}
          inputProps={{ inputMode: "numeric", pattern: "^[1-9][0-9]*$" }}
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

        <CssTextField
          required
          label="Max lend duration"
          variant="outlined"
          value={lendingInput?.maxDuration ?? ""}
          inputProps={{ inputMode: "numeric", pattern: "^[0-9]{0,3}$" }}
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
        <CssTextField
          required
          label="Borrow Price"
          variant="outlined"
          value={lendingInput.borrowPrice ?? ""}
          inputProps={{
            inputMode: "numeric",
            pattern: "^([1-9][0-9]{0,3})|([0-9]{1,4}(\\.[0-9]{0,3}[1-9]))$",
          }}
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
        <MinimalSelect
          name={`inputs.${index}.pmToken`}
          handleChange={handleChange}
          selectedValue={lendingInput.pmToken ?? -1}
          disabled={disabled}
        />
      </CommonInfo>
    </div>
  );
};
