import CssTextField from "../components/css-text-field";

import ActionButton from "../components/action-button";
import { getUniqueCheckboxId } from "../controller/batch-controller";
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
import Loader from "../components/loader";

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

const isInteger = (field: string | number): boolean => {
  try {
    return field !== parseInt(field.toString(), 10);
  } catch (_) {
    return false;
  }
};

function is4Digits(x: number | string) {
  try {
    // precision up to 16 digits after
    const p: number = Number.parseFloat(x.toString()) * 10e3;
    const reminder: number = p - Number.parseInt(p.toString());
    return reminder * 10e15 === 0;
  } catch (e) {
    return false;
  }
}
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
      key: getUniqueCheckboxId(nft),
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
      let fieldName: keyof typeof input = "lendAmount";
      let field = input[fieldName];
      if (typeof field === "undefined") {
        error[fieldName] = "please specify amount";
      } else if (field < 1) {
        error[fieldName] = "amount must be greater than 1";
      } else if (field > Number(input.nft.amount)) {
        error[fieldName] =
          "amount must be less than equal then the total amount available";
      } else if (isInteger(field)) {
        error[fieldName] = "amount must be a whole number";
      }

      fieldName = "maxDuration";
      field = input[fieldName];
      if (typeof field === "undefined") {
        error[fieldName] = "please specify lend duration";
      } else if (field < 1) {
        error[fieldName] = "lend duration must be greater than 1";
      } else if (field > 255) {
        error[fieldName] = "lend duration must be less or equal than 255";
      } else if (isInteger(field)) {
        error[fieldName] = "maxDuration must be a whole number";
      }

      fieldName = "borrowPrice";
      field = input[fieldName];
      if (typeof field === "undefined") {
        error[fieldName] = "please specify the borrow price";
      } else if (field < 0.0001) {
        error[fieldName] =
          "borrow price must be greater than or equal to 0.0001";
      } else if (field > 9999.9999) {
        error[fieldName] = "borrow price must be less then or equal 9999.9999";
      } else if (!is4Digits(field)) {
        error[fieldName] =
          "borrow price only accepts up to 4 fractional digits";
      }

      fieldName = "nftPrice";
      field = input[fieldName];
      if (typeof field === "undefined") {
        error[fieldName] = "please specify collateral";
      } else if (field < 0.0001) {
        error[fieldName] = "collateral must be greater than or equal to 0.0001";
      } else if (field > 9999.9999) {
        error[fieldName] = "collateral must be less then or equal 9999.9999";
      } else if (!is4Digits(field)) {
        error[fieldName] = "collateral only accepts up to 4 fractional digits";
      }

      fieldName = "pmToken";
      field = input[fieldName];
      if (typeof field === "undefined") {
        error[fieldName] = "please specify payment token";
      } else if (field < 0 || field > 5) {
        error[fieldName] = "please specify payment token";
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
      validateOnChange
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
                <>
                  <ActionButton<Nft>
                    title="Approve all"
                    nft={nft}
                    onClick={handleApproveAll}
                    disabled={isApprovalLoading}
                  />
                  {isApprovalLoading && <Loader />}
                </>
              )}
              {(isApproved || isSubmitting) && (
                <>
                  <ActionButton<Nft>
                    title={nfts.length > 1 ? "Lend all" : "Lend"}
                    nft={nft}
                    onClick={submitForm}
                    disabled={!isValid || isSubmitting}
                  />
                  {isSubmitting && <Loader />}
                </>
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
