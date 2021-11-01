import React, { Fragment, useCallback, useEffect, useMemo } from "react";
import produce from "immer";
import create from "zustand";
import shallow from "zustand/shallow";
import { devtools } from "renft-front/hooks/devtools";
import { yupResolver } from "@hookform/resolvers/yup";
import { Transition } from "@headlessui/react";
import { useForm, useFieldArray } from "react-hook-form";

import {
  StartRentNft,
  useRentApproval,
  useStartRent,
} from "renft-front/hooks/contract/useStartRent";
import { TransactionWrapper } from "renft-front/components/transaction-wrapper";
import { Button } from "renft-front/components/common/button";
import { useLendingStore } from "renft-front/hooks/store/useNftStore";
import { TransactionStateEnum } from "renft-front/types";

import { RentItem } from "./rent-item";
import { validationSchema } from "./rent-validate";

import type { Lending } from "renft-front/types/classes";
import type { FormProps, LendFormProps } from "./rent-types";

export const useRentFormState = create<{
  values: Record<string, Lending>;
  setValues: (values: Lending[]) => void;
}>(
  devtools((set) => ({
    values: {},
    setValues: (values: Lending[]) =>
      set(
        produce((state) => {
          values.forEach((value) => {
            state.values[value.id] = { ...value };
          });
        })
      ),
  }))
);
export const RentForm: React.FC<LendFormProps> = ({
  checkedItems,
  onClose,
}) => {
  const {
    isApproved,
    handleApproveAll,
    checkApprovals,
    status: approvalStatus,
  } = useRentApproval();
  const { startRent: handleSave, status } = useStartRent();
  const setValues = useRentFormState(
    useCallback((state) => state.setValues, [])
  );
  const previousValues = useRentFormState(
    useCallback((state) => state.values, []),
    shallow
  );
  const selectedToRent: (Lending & { duration: string })[] = useLendingStore(
    useCallback(
      (state) => {
        return checkedItems.map((i) => {
          const lending = state.lendings[i];
          const previousFormValues = previousValues[lending.id];
          return { ...lending, duration: "", ...previousFormValues };
        });
      },
      [checkedItems, previousValues]
    )
  );
  useEffect(() => {
    checkApprovals(selectedToRent);
  }, [checkApprovals, selectedToRent]);

  const defaultValues: FormProps = {
    inputs: selectedToRent,
  };
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, isValid },
    formState,
  } = useForm<FormProps>({
    defaultValues,
    mode: "onChange",
    shouldFocusError: true,
    resolver: yupResolver(validationSchema),
  });
  const { fields, remove } = useFieldArray({
    control,
    name: "inputs",
  });
  const watchFieldArray = watch("inputs");
  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index],
    };
  });
  const onSubmit = (values: FormProps) => {
    handleSave(
      values.inputs.map<StartRentNft>(
        (lending: Lending & { duration: string }) => ({
          nftAddress: lending.nftAddress,
          tokenId: lending.tokenId,
          amount: lending.lentAmount,
          lendingId: lending.id,
          rentDuration: lending.duration,
          paymentToken: lending.paymentToken,
          isERC721: lending.isERC721,
        })
      )
    );
  };
  const formSubmittedSuccessfully = useMemo(
    () => status.status === TransactionStateEnum.SUCCESS,
    [status]
  );
  const noItems = useMemo(() => {
    return (
      controlledFields.length === 0 ||
      // stupid bug with removal
      (controlledFields.length === 1 && !controlledFields[0].id)
    );
  }, [controlledFields]);

  useEffect(() => {
    const subscription = watch((values: { inputs: Lending[] }) => {
      setValues(values.inputs);
    });
    return () => subscription.unsubscribe();
  }, [watch, setValues]);

  return (
    <div>
      <h1 className="text-xl font-extrabold text-center tracking-tight text-gray-900 sm:text-2xl">
        NFTs to rent
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col space-y-12 mt-4"
        aria-label="rent-form"
      >
        <section aria-labelledby="cart-heading">
          <h2 id="cart-heading" className="sr-only">
            NFTs in your renting cart
          </h2>
          <ul role="list" className="flex flex-col space-y-8  ">
            {noItems && (
              <div className="flex justify-center items-center">
                No item is selected!
              </div>
            )}
            {!noItems &&
              defaultValues.inputs.map((item) => {
                // render the initial values so transition can be shown
                const index = controlledFields.findIndex(
                  (v) => v.id === item.id
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
                      key={item.id}
                      item={controlledFields[index] || item}
                      formState={formState}
                      register={register}
                      removeFromCart={remove}
                      index={index}
                      disabled={formSubmittedSuccessfully}
                    ></RentItem>
                  </Transition>
                );
              })}

            {!noItems && (
              <div className="py-3 flex flex-auto items-end justify-center">
                {!isApproved && !isSubmitting && (
                  <TransactionWrapper
                    isLoading={approvalStatus.isLoading}
                    transactionHashes={approvalStatus.transactionHash}
                    status={TransactionStateEnum.PENDING}
                  >
                    <Button
                      description="Approve Payment tokens"
                      onClick={handleApproveAll}
                      disabled={approvalStatus.isLoading || isSubmitting}
                    />
                  </TransactionWrapper>
                )}
                {(isApproved || isSubmitting) && (
                  <TransactionWrapper
                    isLoading={isSubmitting || status.isLoading}
                    status={status.status}
                    closeWindow={onClose}
                    transactionHashes={status.transactionHash}
                  >
                    <Button
                      description={
                        selectedToRent.length > 1 ? "Rent all" : "Rent"
                      }
                      onClick={handleSubmit(onSubmit)}
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
            )}
          </ul>
        </section>
      </form>
    </div>
  );
};
