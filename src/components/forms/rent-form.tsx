import { TextField } from "../common/text-field";

import ActionButton from "../common/action-button";
import { Lending, Nft } from "../../contexts/graph/classes";
import React, { useCallback, Fragment, Ref } from "react";
import ModalFields from "../modals/modal-fields";
import {
  Formik,
  FormikErrors,
  FormikTouched,
  FieldArray,
  FormikBag,
} from "formik";
import { TransactionStateEnum } from "../../types";
import { StartRentNft } from "../../hooks/contract/useStartRent";
import { TransactionWrapper } from "../transaction-wrapper";
import { PaymentToken } from "@renft/sdk";
import { TransactionStatus } from "../../hooks/useTransactionWrapper";
import { Observable } from "rxjs";
import { CatalogueItemRow } from "../catalogue-item/catalogue-item-row";
import { CatalogueItemDisplay } from "../catalogue-item/catalogue-item-display";
import { useNftMetaState } from "../../hooks/queries/useMetaState";
import shallow from "zustand/shallow";
import XIcon from "@heroicons/react/outline/XIcon";
import { Transition } from "@headlessui/react";

type LendFormProps = {
  nfts: Lending[];
  isApproved: boolean;
  handleApproveAll: () => void;
  handleSubmit: (arg: StartRentNft[]) => Observable<TransactionStatus>;
  approvalStatus: TransactionStatus;
  onClose: () => void;
};
interface LendingWithKey extends Lending {
  key: string;
  duration: number | undefined;
}
type FormProps = { inputs: LendingWithKey[] };
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
  const validate = (values: { inputs: LendingWithKey[] }) => {
    const errors: (Record<string, string | undefined> | undefined)[] = Array(
      values.inputs.length
    );
    values.inputs.forEach((input: LendingWithKey, index: number) => {
      const error: Record<string, string | undefined> = {};
      if (typeof input.duration === "undefined") {
        error.duration = "please specify duration";
      } else if (input.duration > input.lending.maxRentDuration) {
        error.duration =
          "the duration cannot be greater then the max rent duration";
      } else if (input.duration != parseInt(input.duration.toString(), 10)) {
        error.duration = "maxDuration must be a whole number";
      } else if (!/^\d+(\.\d+)?$/i.test(input.duration.toString())) {
        error.duration = "amount must be a number";
      }
      errors[index] = Object.keys(error).length > 0 ? error : undefined;
    });
    const valid = errors.filter((e) => e !== undefined).length < 1;
    if (valid) return;
    return { inputs: errors };
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

const RentItem: React.FC<{
  item: LendingWithKey;
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
  removeFromCart: (id: number) => void;
  index: number;
  touched: FormikTouched<LendingWithKey> | null;
  errors: FormikErrors<LendingWithKey> | null;
  disabled: boolean;
}> = React.forwardRef(
  (
    {
      item,
      index,
      handleChange,
      handleBlur,
      errors,
      touched,
      disabled,
      removeFromCart,
    },
    ref
  ) => {
    const token = item.lending.paymentToken;
    const paymentToken = PaymentToken[token];
    const dailyRentPrice = item.lending.dailyRentPrice;
    const nftPrice = item.lending.nftPrice;
    const totalRent =
      (item.lending.nftPrice || 0) * Number(item.amount) +
      (item.lending.dailyRentPrice || 0) * Number(item.duration);

    const meta = useNftMetaState(
      useCallback(
        (state) => {
          return state.metas[item.nId] || {};
        },
        [item.nId]
      ),
      shallow
    );
    const removeItem = useCallback(() => {
      removeFromCart(index);
    }, [index, removeFromCart]);

    const renderItem = () => {
      const days = item.lending.maxRentDuration;
      return (
        <span>
          <span>Rent duration </span>
          <span>
            (max {days} {days > 1 ? "days" : "day"})
          </span>
        </span>
      );
    };
    return (
      <li
        ref={ref as Ref<HTMLLIElement>}
        key={item.id}
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
          <ModalFields nft={item} key={item.id}>
            <CatalogueItemRow text="Rent Amount" value={item.amount} />
            <TextField
              required
              label={renderItem()}
              value={item.duration || ""}
              name={`inputs.${index}.duration`}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                !!touched &&
                touched.duration &&
                Boolean(errors && errors.duration)
              }
              helperText={
                touched && touched.duration && errors && errors.duration
              }
              disabled={disabled}
            />
            <CatalogueItemRow
              text={`Daily rent price [${paymentToken}]`}
              value={dailyRentPrice}
            />
            <CatalogueItemRow
              text={`Collateral (per item) [${paymentToken}]`}
              value={nftPrice}
            />
            <CatalogueItemRow
              text={`Rent [${paymentToken}]`}
              value={
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    overflow: "visible",
                  }}
                >
                  <span>
                    &nbsp;&nbsp;&nbsp;{dailyRentPrice} x{" "}
                    {item.duration ? item.duration : 0} days
                  </span>
                  <span>
                    + &nbsp;{Number(nftPrice)} x {Number(item.amount)}
                  </span>
                  <span>=&nbsp;{totalRent ? totalRent : "? "}</span>
                </div>
              }
            />
          </ModalFields>
        </div>
      </li>
    );
  }
);

RentItem.displayName = "RentItem";
