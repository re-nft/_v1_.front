import ActionButton from "../../common/action-button";
import { Nft } from "../../../types/classes";
import React, { Fragment } from "react";
import { Formik, FormikErrors, FieldArray, FormikBag } from "formik";
import { TransactionStateEnum } from "../../../types";
import { StartRentNft } from "../../../hooks/contract/useStartRent";
import { TransactionWrapper } from "../../transaction-wrapper";
import { Transition } from "@headlessui/react";
import { FormProps, LendFormProps, LendingWithKey } from "./rent-types";
import { RentItem } from "./rent-item";
import { validate } from "./rent-validate";

export const RentForm: React.FC<LendFormProps> = ({
  nfts,
  isApproved,
  handleApproveAll,
  handleSubmit,
  approvalStatus,
  onClose,
}) => {
  const [nft] = nfts;
  const initialValues: FormProps = {
    inputs: nfts.map<LendingWithKey>((nft) => ({
      key: nft.id,
      duration: undefined,
      ...nft,
    })),
  };
  const onSubmit = (
    values: FormProps,
    { setSubmitting, setStatus }: FormikBag<FormProps, unknown>
  ) => {
    setSubmitting(true);
    setStatus([TransactionStateEnum.PENDING]);
    const sub = handleSubmit(
      values.inputs.map<StartRentNft>((nft) => ({
        address: nft.address,
        tokenId: nft.tokenId,
        amount: nft.lending.lentAmount,
        lendingId: nft.lending.id,
        rentDuration: (nft.duration as number).toString(),
        paymentToken: nft.lending.paymentToken,
        isERC721: nft.isERC721,
      }))
    ).subscribe({
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
        NFTs to rent
      </h1>
      <Formik
        // @ts-ignore
        onSubmit={onSubmit}
        initialValues={initialValues}
        validate={validate}
        validateOnMount
        validateOnBlur
        validateOnChange
        initialStatus={[false, undefined]}
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
                  NFTs in your renting cart
                </h2>
                <ul role="list" className="flex flex-col space-y-8  ">
                  <FieldArray name="inputs">
                    {({ remove }) => {
                      return initialValues.inputs.map(
                        (item: LendingWithKey) => {
                          // render the initial values so transition can be shown
                          const index = values.inputs.findIndex(
                            (v: LendingWithKey) => v.nId === item.nId
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
                              key={item.id}
                            >
                              <RentItem
                                key={item.key}
                                item={item}
                                removeFromCart={remove}
                                index={index}
                                handleBlur={handleBlur}
                                handleChange={handleChange}
                                touched={
                                  touched.inputs ? touched.inputs[index] : null
                                }
                                errors={
                                  errors.inputs
                                    ? (errors.inputs[
                                        index
                                      ] as FormikErrors<LendingWithKey>)
                                    : null
                                }
                                disabled={formSubmittedSuccessfully}
                              ></RentItem>
                            </Transition>
                          );
                        }
                      );
                    }}
                  </FieldArray>

                  <div className="py-3 flex flex-auto items-end justify-center">
                    {!isApproved && !isSubmitting && (
                      <TransactionWrapper
                        isLoading={approvalStatus.isLoading}
                        transactionHashes={approvalStatus.transactionHash}
                        status={TransactionStateEnum.PENDING}
                      >
                        <ActionButton<Nft>
                          title="Approve Payment tokens"
                          nft={nft}
                          onClick={handleApproveAll}
                          disabled={approvalStatus.isLoading || isSubmitting}
                        />
                      </TransactionWrapper>
                    )}
                    {(isApproved || isSubmitting) && (
                      <TransactionWrapper
                        isLoading={isSubmitting}
                        status={status.status}
                        closeWindow={onClose}
                        transactionHashes={status.transactionHash}
                      >
                        <ActionButton<Nft>
                          title={nfts.length > 1 ? "Rent all" : "Rent"}
                          nft={nft}
                          onClick={submitForm}
                          disabled={
                            !isValid ||
                            !isApproved ||
                            isSubmitting ||
                            formSubmittedSuccessfully
                          }
                        />
                      </TransactionWrapper>
                    )}
                  </div>
                </ul>
              </section>
            </form>
          );
        }}
      </Formik>
    </div>
  );
};
