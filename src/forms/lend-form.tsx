import ActionButton from "../components/common/action-button";
import { getUniqueCheckboxId } from "../controller/batch-controller";
import { Nft } from "../contexts/graph/classes";
import React from "react";
import { Formik, FormikErrors, FieldArray, FormikBag } from "formik";
import { LendInput } from "./lend-input";
import { TransactionWrapper } from "../components/transaction-wrapper";
import { TransactionStateEnum } from "../types";
import { Observable } from "rxjs";
import { TransactionStatus } from "../hooks/useTransactionWrapper";

type LendFormProps = {
  nfts: Nft[];
  isApproved: boolean;
  handleApproveAll: () => void;
  handleSubmit: (arg: LendInputDefined[]) => Observable<TransactionStatus>;
  approvalStatus: TransactionStatus;
  onClose: () => void
};
export type LendInputProps = {
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
type FormProps = { inputs: LendInputProps[] };

function is4Digits(x: number | string) {
  try {
    // precision up to 16 digits after
    const [_, b] = x.toString().split(".");
    if (!b) return true;
    const reminder = b.toString().slice(4);
    if (!reminder) return true;
    return reminder.replaceAll("0", "").length < 1;
  } catch (e) {
    return false;
  }
}
export const LendForm: React.FC<LendFormProps> = ({
  nfts,
  isApproved,
  handleApproveAll,
  handleSubmit,
  approvalStatus,
  onClose,
}) => {
  const [nft] = nfts;
  const initialValues = {
    inputs: nfts.map<LendInputProps>((nft) => ({
      tokenId: nft.tokenId,
      nft: nft,
      key: getUniqueCheckboxId(nft),
      lendAmount: Number(nft.amount) === 1 || nft.isERC721 ? 1 : undefined,
      maxDuration: undefined,
      borrowPrice: undefined,
      nftPrice: undefined,
      pmToken: undefined,
    }))
  };
  const onSubmit = (
    values: FormProps,
    { setSubmitting, setStatus }: FormikBag<FormProps, unknown>
  ) => {
    setSubmitting(true);
    setStatus([TransactionStateEnum.PENDING])
    const sub = handleSubmit(values.inputs as LendInputDefined[]).subscribe({
      next: (status)=>{
        setStatus(status)
      },
      complete: ()=>{
        setSubmitting(false)
        sub.unsubscribe()
      }
    })
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
      initialStatus={{
        isLoading: false,
        status: TransactionStateEnum.PENDING,
      }}
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
        status
      }) => {
        const formSubmittedSuccessfully = status.status === TransactionStateEnum.SUCCESS
        return (
          <form onSubmit={handleSubmit}>
            <FieldArray name="inputs">
              {() => {
                return values.inputs.map(
                  (lendingInput: LendInputProps, index: number) => {
                    return (
                      <LendInput
                        key={lendingInput.key}
                        lendingInput={lendingInput}
                        index={index}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        disabled={isSubmitting || formSubmittedSuccessfully}
                        touched={touched.inputs ? touched.inputs[index] : null}
                        errors={
                          errors.inputs
                            ? (errors.inputs[
                                index
                              ] as FormikErrors<LendInputProps>)
                            : null
                        }
                      ></LendInput>
                    );
                  }
                );
              }}
            </FieldArray>

            <div className="modal-dialog-button">
              {!isApproved && !isSubmitting && (
                <TransactionWrapper isLoading={approvalStatus.isLoading} status={approvalStatus.status} transactionHashes={approvalStatus.transactionHash}>
                  <ActionButton<Nft>
                    title="Approve all"
                    nft={nft}
                    onClick={handleApproveAll}
                    disabled={approvalStatus.isLoading}
                  />
                </TransactionWrapper>
              )}
              {(isApproved || isSubmitting) && (
                <TransactionWrapper isLoading={isSubmitting} status={status.status} transactionHashes={status.transactionHash} closeWindow={onClose}>
                  <ActionButton<Nft>
                    title={nfts.length > 1 ? "Lend all" : "Lend"}
                    nft={nft}
                    onClick={submitForm}
                    disabled={!isValid || isSubmitting || formSubmittedSuccessfully}
                  />
                </TransactionWrapper>
              )}
            </div>
          </form>
        );
      }}
    </Formik>
  );
};

const isInteger = (field: string | number): boolean => {
  try {
    return field != parseInt(field.toString(), 10);
  } catch (_) {
    return false;
  }
};

function is4Digits(x: number | string) {
  try {
    // precision up to 16 digits after
    const [_, b] = x.toString().split(".");
    if (!b) return true;
    const reminder = b.toString().slice(4);
    if (!reminder) return true;
    return reminder.replaceAll("0", "").length < 1;
  } catch (e) {
    return false;
  }
}
const validate = (values: FormProps) => {
  const errors: (Record<string, string | undefined> | undefined)[] = Array(
    values.inputs.length
  );
  values.inputs.forEach((input: LendInputProps, index: number) => {
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
    } else if (!(/^\d+(\.\d+)?$/i).test(field.toString())){
      error[fieldName] = "amount must be a number";
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
    } else if (!(/^\d+(\.\d+)?$/i).test(field.toString())){
      error[fieldName] = "amount must be a number";
    }

    fieldName = "borrowPrice";
    field = input[fieldName];
    if (typeof field === "undefined") {
      error[fieldName] = "please specify the borrow price";
    } else if (field < 0.0001) {
      error[fieldName] = "borrow price must be greater than or equal to 0.0001";
    } else if (field > 9999.9999) {
      error[fieldName] = "borrow price must be less then or equal 9999.9999";
    } else if (!is4Digits(field)) {
      error[fieldName] = "borrow price only accepts up to 4 fractional digits";
    } else if (!(/^\d+(\.\d+)?$/i).test(field.toString())){
      error[fieldName] = "amount must be a number";
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
    } else if (!(/^\d+(\.\d+)?$/i).test(field.toString())){
      error[fieldName] = "amount must be a number";
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
