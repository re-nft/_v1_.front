import ActionButton from "../../common/action-button";
import { Nft } from "../../../types/classes";
import React, { Fragment } from "react";
import { Formik, FormikErrors, FieldArray, FormikBag } from "formik";
import { LendItem } from "./lend-item";
import { TransactionWrapper } from "../../transaction-wrapper";
import { TransactionStateEnum } from "../../../types";
import {
  FormProps,
  LendFormProps,
  LendInputDefined,
  LendInputProps,
} from "./lend-types";
import { Transition } from "@headlessui/react";
import { validate } from "./lend-validation";

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
      lendAmount: nft.amount == "1" || nft.isERC721 ? 1 : Number(nft.amount),
      amount: nft.amount == "1" || nft.isERC721 ? "1" : nft.amount,
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
