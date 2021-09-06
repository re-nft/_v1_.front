import ActionButton from "../common/action-button";
import { Nft } from "../../types/classes";
import React, { Fragment } from "react";
import { Formik, FormikErrors, FieldArray, FormikBag } from "formik";
import { LendItem } from "./lend-item";
import { TransactionWrapper } from "../transaction-wrapper";
import { TransactionStateEnum } from "../../types";
import { Observable } from "rxjs";
import { TransactionStatus } from "../../hooks/useTransactionWrapper";
import { Transition } from "@headlessui/react";

type LendFormProps = {
  nfts: Nft[];
  isApproved: boolean;
  handleApproveAll: () => void;
  handleSubmit: (arg: LendInputDefined[]) => Observable<TransactionStatus>;
  approvalStatus: TransactionStatus;
  onClose: () => void;
};

export type LendInputProps = {
  amount: string;
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
      key: nft.id,
      lendAmount: nft.amount == "1" || nft.isERC721 ? 1 : undefined,
      amount: nft.amount,
      maxDuration: undefined,
      borrowPrice: undefined,
      nftPrice: undefined,
      pmToken: undefined,
    })),
  };
  const onSubmit = (
    values: FormProps,
    { setSubmitting, setStatus }: FormikBag<FormProps, unknown>
  ) => {
    setSubmitting(true);
    setStatus([TransactionStateEnum.PENDING]);
    const sub = handleSubmit(values.inputs as LendInputDefined[]).subscribe({
      next: (status) => {
        setStatus(status);
      },
      complete: () => {
        setSubmitting(false);
        sub.unsubscribe();
      },
    });
  };

  return (
    <div>
      <h1 className="text-xl font-extrabold text-center tracking-tight text-gray-900 sm:text-2xl">
        NFTs to lend
      </h1>
      <Formik
        // TODO remove this
        // @ts-ignore
        onSubmit={onSubmit}
        initialValues={initialValues}
        enableReinitialize={true}
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
          status,
        }) => {
          const formSubmittedSuccessfully =
            status.status === TransactionStateEnum.SUCCESS;
          return (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col space-y-12 mt-4"
            >
              <section aria-labelledby="cart-heading">
                <h2 id="cart-heading" className="sr-only">
                  NFTs in your lending cart
                </h2>
                <ul role="list" className="flex flex-col space-y-8 ">
                  <FieldArray name="inputs">
                    {({ remove }) => {
                      return initialValues.inputs.map(
                        (lendingInput: LendInputProps) => {
                          // render the initial values so transition can be shown
                          const index = values.inputs.findIndex(
                            (v: LendInputProps) =>
                              v.nft.nId === lendingInput.nft.nId
                          );
                          const show = index >= 0;
                          return (
                            <Transition
                              show={show}
                              as={Fragment}
                              enter="transition-opacity ease-linear duration-300"
                              enterFrom="opacity-0"
                              enterTo="opacity-100"
                              leave="transition-opacity ease-linear duration-300"
                              leaveFrom="opacity-100"
                              leaveTo="opacity-0"
                              key={lendingInput.nft.nId}
                            >
                              <LendItem
                                key={lendingInput.key}
                                lendingInput={lendingInput}
                                index={index}
                                handleBlur={handleBlur}
                                handleChange={handleChange}
                                disabled={
                                  isSubmitting || formSubmittedSuccessfully
                                }
                                touched={
                                  touched.inputs ? touched.inputs[index] : null
                                }
                                errors={
                                  errors.inputs
                                    ? (errors.inputs[
                                        index
                                      ] as FormikErrors<LendInputProps>)
                                    : null
                                }
                                removeFromCart={remove}
                              ></LendItem>
                            </Transition>
                          );
                        }
                      );
                    }}
                  </FieldArray>
                </ul>
                <div className="py-3 flex flex-auto items-end justify-center">
                  {!isApproved && !isSubmitting && (
                    <TransactionWrapper
                      isLoading={approvalStatus.isLoading}
                      status={approvalStatus.status}
                      transactionHashes={approvalStatus.transactionHash}
                    >
                      <ActionButton<Nft>
                        title="Approve all"
                        nft={nft}
                        onClick={handleApproveAll}
                        disabled={approvalStatus.isLoading}
                      />
                    </TransactionWrapper>
                  )}
                  {(isApproved || isSubmitting) && (
                    <TransactionWrapper
                      isLoading={isSubmitting}
                      status={status.status}
                      transactionHashes={status.transactionHash}
                      closeWindow={onClose}
                    >
                      <ActionButton<Nft>
                        title={nfts.length > 1 ? "Lend all" : "Lend"}
                        nft={nft}
                        onClick={submitForm}
                        disabled={
                          !isValid || isSubmitting || formSubmittedSuccessfully
                        }
                      />
                    </TransactionWrapper>
                  )}
                </div>
              </section>
            </form>
          );
        }}
      </Formik>
    </div>
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
    } else if (!/^\d+(\.\d+)?$/i.test(field.toString())) {
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
    } else if (!/^\d+(\.\d+)?$/i.test(field.toString())) {
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
    } else if (!/^\d+(\.\d+)?$/i.test(field.toString())) {
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
    } else if (!/^\d+(\.\d+)?$/i.test(field.toString())) {
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
