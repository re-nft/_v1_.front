import CssTextField from "../components/css-text-field";

import ActionButton from "../components/action-button";
import { getUniqueID } from "../controller/batch-controller";
import { Nft } from "../contexts/graph/classes";
import React from "react";
import CommonInfo from "../modals/common-info";
import {
  Formik,
  FormikErrors,
  FormikTouched,
  FieldArray,
  FormikBag,
} from "formik";
import MinimalSelect from "../components/select";

type LendFormProps = {
  nfts: Nft[];
  isApproved: boolean;
  handleApproveAll: () => void;
  handleSubmit: (arg: LendInputDefined[]) => Promise<void>;
  isApprovalLoading: boolean;
};
export type LendInput = {
  lendAmount: number | undefined;
  maxDuration: number | undefined;
  borrowPrice: number | undefined;
  nftPrice: number | undefined;
  tokenId: string;
  pmToken: number | undefined;
  key: string;
  nft: Nft;
};
export type LendInputDefined = {
  lendAmount: number;
  maxDuration: number;
  borrowPrice: number;
  nftPrice: number;
  tokenId: string;
  pmToken: number;
  key: string;
  nft: Nft;
};
type FormProps = { inputs: LendInput[] };
export const LendForm: React.FC<LendFormProps> = ({
  nfts,
  isApproved,
  handleApproveAll,
  handleSubmit,
  isApprovalLoading,
}) => {
  const [nft] = nfts;
  const initialValues = {
    inputs: nfts.map<LendInput>((nft) => ({
      tokenId: nft.tokenId,
      nft: nft,
      key: getUniqueID(nft.address, nft.tokenId),
      lendAmount: Number(nft.amount) === 1 || nft.isERC721 ? 1 : undefined,
      maxDuration: undefined,
      borrowPrice: undefined,
      nftPrice: undefined,
      pmToken: undefined,
    })),
  };
  const onSubmit = (
    values: FormProps,
    { setSubmitting }: FormikBag<FormProps, unknown>
  ) => {
    setSubmitting(true);
    handleSubmit(values.inputs as LendInputDefined[]).finally(() => {
      setSubmitting(false);
    });
  };

  const validate = (values: FormProps) => {
    const errors: (Record<string, string | undefined> | undefined)[] = Array(
      values.inputs.length
    );
    values.inputs.forEach((input: LendInput, index: number) => {
      const error: Record<string, string | undefined> = {};
      if (typeof input.lendAmount === "undefined") {
        error.lendAmount = "please specify amount";
      } else if (input.lendAmount < 1) {
        error.lendAmount = "amount must be greater than 1";
      } else if (input.lendAmount > Number(input.nft.amount)) {
        error.lendAmount =
          "amount must be less than equal then the total amount available";
      } else if (
        input.lendAmount !== parseInt(input.lendAmount.toString(), 10)
      ) {
        error.lendAmount = "amount must be a whole number";
      }
      if (typeof input.maxDuration === "undefined") {
        error.maxDuration = "please specify lend duration";
      } else if (input.maxDuration < 1) {
        error.maxDuration = "lend duration must be greater than 1";
      } else if (input.maxDuration > 255) {
        error.maxDuration = "lend duration must be less or equal than 255";
      } else if (
        input.maxDuration !== parseInt(input.maxDuration.toString(), 10)
      ) {
        error.maxDuration = "maxDuration must be a whole number";
      }
      if (typeof input.borrowPrice === "undefined") {
        error.borrowPrice = "please specify the borrow price";
      } else if (input.borrowPrice < 0.0001) {
        error.borrowPrice = "borrow price must be greater than 0";
      } else if (input.borrowPrice > 9999.9999) {
        error.borrowPrice = "borrow price must be less then 1000";
      }
      if (typeof input.nftPrice === "undefined") {
        error.nftPrice = "please specify collateral";
      } else if (input.nftPrice < 0.0001) {
        error.nftPrice = "collateral must be greater than 0";
      } else if (input.nftPrice > 9999.9999) {
        error.borrowPrice = "collateral must be less then 1000";
      }
      if (typeof input.pmToken === "undefined") {
        error.pmToken = "please specify payment token";
      } else if (input.pmToken < 0 || input.pmToken > 5) {
        error.pmToken = "please specify payment token";
      }
      errors[index] = Object.keys(error).length > 0 ? error : undefined;
    });
    const valid = errors.filter((e) => e !== undefined).length < 1;
    if (valid) return;
    return { inputs: errors };
  };
  return (
    <Formik
      // TODO remove this
      // @ts-ignore
      onSubmit={onSubmit}
      initialValues={initialValues}
      validate={validate}
      validateOnMount
      validateOnBlur
    >
      {({
        values,
        errors,
        touched,
        handleSubmit,
        handleChange,
        handleBlur,
        isValid,
        isSubmitting,
        submitForm,
      }) => {
        return (
          <form onSubmit={handleSubmit}>
            <FieldArray name="inputs">
              {() => {
                return values.inputs.map(
                  (lendingInput: LendInput, index: number) => {
                    return (
                      <ModalDialogSection
                        key={lendingInput.key}
                        lendingInput={lendingInput}
                        index={index}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        touched={touched.inputs ? touched.inputs[index] : null}
                        errors={
                          errors.inputs
                            ? (errors.inputs[index] as FormikErrors<LendInput>)
                            : null
                        }
                      ></ModalDialogSection>
                    );
                  }
                );
              }}
            </FieldArray>

            <div className="modal-dialog-button">
              {!isApproved && !isSubmitting && (
                <ActionButton<Nft>
                  title="Approve all"
                  nft={nft}
                  onClick={handleApproveAll}
                  disabled={isApprovalLoading}
                />
              )}
              {(isApproved || isSubmitting) && (
                <ActionButton<Nft>
                  title={nfts.length > 1 ? "Lend all" : "Lend"}
                  nft={nft}
                  onClick={submitForm}
                  disabled={!isValid || isSubmitting}
                />
              )}
            </div>
          </form>
        );
      }}
    </Formik>
  );
};
const voidFn = () => {
  // do nothing func
};
const ModalDialogSection: React.FC<{
  lendingInput: LendInput;
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
  touched: FormikTouched<LendInput> | null;
  errors: FormikErrors<LendInput> | null;
}> = ({ lendingInput, index, handleChange, handleBlur, errors, touched }) => {
  const only1Item =
    Number(lendingInput.nft.amount) === 1 || lendingInput.nft.isERC721;
  return (
    <div className="modal-dialog-section" key={lendingInput.key}>
      <CommonInfo nft={lendingInput.nft}>
        {/* lendAmount for 721 is ignored */}

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
          disabled={only1Item}
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
        />
        <MinimalSelect
          name={`inputs.${index}.pmToken`}
          handleChange={handleChange}
          selectedValue={lendingInput.pmToken ?? -1}
        />
      </CommonInfo>
    </div>
  );
};
