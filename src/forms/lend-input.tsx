import React from "react";
import CommonInfo from "../modals/common-info";
import { FormikErrors, FormikTouched } from "formik";
import MinimalSelect from "../components/select";
import { LendInputProps } from "./lend-form";
import CssTextField from "../components/css-text-field";

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
  const { lendingInput, index, handleChange, handleBlur, errors, touched, disabled } =
    input;
  const only1Item =
    Number(lendingInput.nft.amount) === 1 || lendingInput.nft.isERC721;
  return (
    <div className="modal-dialog-section" key={lendingInput.key}>
      <CommonInfo nft={lendingInput.nft}>
        {/* lendAmount for 721 is ignored */}
        <div className="modal-dialog-for">
          <div className="label">Available Amount</div>
          <div className="dot"></div>
          {/* we can do this because checked items will have the right amount when we pass them here */}
          <div className="label">{lendingInput.nft.amount}</div>
        </div>
        <CssTextField
          required
          label="Amount"
          variant="outlined"
          value={lendingInput.lendAmount ?? ""}
          type="number"
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
          type="number"
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
          type="number"
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
        <CssTextField
          required
          label="Collateral"
          variant="outlined"
          value={lendingInput.nftPrice ?? ""}
          type="number"
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
