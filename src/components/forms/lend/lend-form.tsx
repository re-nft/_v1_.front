import React, { Fragment, useMemo, useCallback, useEffect } from "react";
import { Transition } from "@headlessui/react";
import {
  useForm,
  useFieldArray,
  UseFormRegister,
  FormState
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { devtools } from "zustand/middleware";
import create from "zustand";
import produce from "immer";
import shallow from "zustand/shallow";

import { TransactionStateEnum } from "renft-front/types";
import { TransactionWrapper } from "renft-front/components/transaction-wrapper";
import { Button } from "renft-front/components/common/button";
import { useStartLend } from "renft-front/hooks/contract/useStartLend";
import { useNFTApproval } from "renft-front/hooks/contract/useNFTApproval";
import { useNftsStore } from "renft-front/hooks/store/useNftStore";

import { LendItem } from "./lend-item";
import { validationSchema } from "./lend-validation";

import type {
  FormProps,
  LendFormProps,
  LendInputDefined,
  LendInputProps
} from "./lend-types";


export const useLendFormState = create<{
  values: Record<string, LendInputProps>;
  setValues: (values: LendInputProps[]) => void;
}>(
  devtools((set) => ({
    values: {},
    setValues: (values: LendInputProps[]) =>
      set(
        produce((state) => {
          values.forEach((value) => {
            if (value.nft.id) state.values[value.nft.id] = { ...value };
          });
        })
      )
  }))
);

export const LendForm: React.FC<LendFormProps> = ({
  checkedItems,
  onClose
}) => {
  const { status, startLend } = useStartLend();
  const setValues = useLendFormState(
    useCallback((state) => state.setValues, [])
  );
  const previousValues = useLendFormState(
    useCallback((state) => state.values, []),
    shallow
  );
  const ownedNfts = useNftsStore(
    useCallback(
      (state) => {
        return checkedItems.map((i) => state.nfts[i]);
      },
      [checkedItems]
    )
  );
  const amounts = useNftsStore(
    useCallback((state) => {
      return state.amounts;
    }, [])
  );
  const { handleApproveAll, isApproved, approvalStatus } =
    useNFTApproval(ownedNfts);

  const defaultValues = useMemo(
    () => ({
      inputs: ownedNfts.map<LendInputProps>((nft) => {
        const amount = amounts.get(nft.nId);
        const previousValue: LendInputProps | null = previousValues[nft.nId];
        return Object.assign(
          {
            tokenId: nft.tokenId,
            nft: nft,
            lendAmount: amount || 1,
            amount: amount?.toString() || "1",
            nftAddress: nft.nftAddress
          },
          previousValue
        );
      })
    }),
    [ownedNfts, amounts, previousValues]
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, isValid },
    formState
  } = useForm<FormProps>({
    defaultValues: { ...defaultValues },
    mode: "onChange",
    shouldFocusError: true,
    resolver: yupResolver(validationSchema)
  });
  const { fields, remove } = useFieldArray({
    control,
    name: "inputs"
  });
  const watchFieldArray = watch("inputs");
  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index]
    };
  });
  useEffect(() => {
    const subscription = watch((values: { inputs: LendInputProps[] }) => {
      setValues(values.inputs);
    });
    return () => subscription.unsubscribe();
  }, [watch, setValues]);

  const onSubmit = (values: FormProps) => {
    startLend(values.inputs as LendInputDefined[]);
  };
  const formSubmittedSuccessfully = useMemo(
    () => status.status === TransactionStateEnum.SUCCESS,
    [status]
  );
  const noItems = useMemo(() => {
    return (
      controlledFields.length === 0 ||
      // stupid bug with removal
      (controlledFields.length === 1 && !controlledFields[0].nft)
    );
  }, [controlledFields]);
  return (
    <div>
      <h1 className="text-xl font-extrabold text-center tracking-tight text-gray-900 sm:text-2xl">
        NFTs to lend
      </h1>
      <form
        className="flex flex-col space-y-12 mt-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <section aria-labelledby="cart-heading">
          <h2 id="cart-heading" className="sr-only">
            NFTs in your lending cart
          </h2>
          <ul role="list" className="flex flex-col space-y-8 ">
            {noItems && (
              <div className="flex justify-center items-center">
                No item is selected!
              </div>
            )}
            {!noItems &&
              defaultValues.inputs.map((item: LendInputProps) => {
                return (
                  <TransitionLendItem
                    key={item.nft.id}
                    register={register}
                    item={item}
                    controlledFields={controlledFields}
                    remove={remove}
                    formState={formState}
                    isSubmitting={isSubmitting}
                    formSubmittedSuccessfully={formSubmittedSuccessfully}
                  />
                );
              })}
          </ul>
          {!noItems && (
            <div className="py-3 flex flex-auto items-end justify-center">
              {!isApproved && !isSubmitting && (
                <TransactionWrapper
                  isLoading={approvalStatus.isLoading}
                  status={approvalStatus.status}
                  transactionHashes={approvalStatus.transactionHash}
                >
                  <Button
                    description="Approve all"
                    onClick={handleApproveAll}
                    disabled={approvalStatus.isLoading}
                  />
                </TransactionWrapper>
              )}
              {(isApproved || isSubmitting) && (
                <TransactionWrapper
                  isLoading={isSubmitting || status.isLoading}
                  status={status.status}
                  transactionHashes={status.transactionHash}
                  closeWindow={onClose}
                >
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    description={ownedNfts.length > 1 ? "Lend all" : "Lend"}
                    disabled={
                      !isValid || isSubmitting || formSubmittedSuccessfully
                    }
                  />
                </TransactionWrapper>
              )}
            </div>
          )}
        </section>
      </form>
    </div>
  );
};

const TransitionLendItem: React.FC<{
  item: LendInputProps;
  controlledFields: LendInputProps[];
  remove: (index: number) => void;
  register: UseFormRegister<FormProps>;
  formState: FormState<FormProps>;
  formSubmittedSuccessfully: boolean;
  isSubmitting: boolean;
}> = ({
  item,
  controlledFields,
  formSubmittedSuccessfully,
  register,
  remove,
  isSubmitting,
  formState
}) => {
    // render the initial values so transition can be shown
    const index = useMemo(
      () =>
        controlledFields.findIndex((v: LendInputProps) => {
          if (v === null || !v.nft) return -1;
          return v.nft.nId === item.nft.nId;
        }),
      [controlledFields, item.nft.nId]
    );
    const show = useMemo(() => {
      const controlledItem = controlledFields[index];
      return Boolean(controlledItem && controlledItem.nft && index >= 0);
    }, [controlledFields, index]);

    // there is some bug here
    const value = useMemo(() => {
      const controlledItem = controlledFields[index];
      // bug with removal
      return controlledItem && controlledItem.nft ? controlledItem : item;
    }, [controlledFields, index, item]);

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
      >
        <LendItem
          lendingInput={value}
          index={index}
          register={register}
          formState={formState}
          disabled={isSubmitting || formSubmittedSuccessfully}
          removeFromCart={remove}
        ></LendItem>
      </Transition>
    );
  };
