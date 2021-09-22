import React, { Fragment, useMemo, useState, useCallback } from "react";
import { LendItem } from "./lend-item";
import { TransactionWrapper } from "../../transaction-wrapper";
import { TransactionStateEnum } from "../../../types";
import {
  FormProps,
  LendFormProps,
  LendInputDefined,
  LendInputProps
} from "./lend-types";
import { Transition } from "@headlessui/react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { validationSchema } from "./lend-validation";
import { Button } from "../../common/button";
import { useStartLend } from "../../../hooks/contract/useStartLend";
import { useNFTApproval } from "../../../hooks/contract/useNFTApproval";
import { useNftsStore } from "../../../hooks/store/useNftStore";

export const LendForm: React.FC<LendFormProps> = ({
  checkedItems,
  onClose
}) => {
  const handleSave = useStartLend();
  const ownedNfts = useNftsStore(
    useCallback(
      (state) => {
        return checkedItems.map((i) => state.nfts[i])
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
        return {
          tokenId: nft.tokenId,
          nft: nft,
          lendAmount: amount || 1,
          amount: amount?.toString() || '1',
          nftAddress: nft.nftAddress
        };
      })
    }),
    [ownedNfts, amounts]
  );
  const [status, setStatus] = useState(TransactionStateEnum.PENDING);
  const [transactionHash, setTransactionhash] = useState<
    string[] | undefined
  >();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, isValid },
    formState
  } = useForm<FormProps>({
    defaultValues,
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
  const onSubmit = (values: FormProps) => {
    setStatus(TransactionStateEnum.PENDING);
    return new Promise<void>((resolve) => {
      const sub = handleSave(values.inputs as LendInputDefined[]).subscribe({
        next: (status) => {
          setStatus(status.status);
          setTransactionhash(status.transactionHash);
        },
        complete: () => {
          sub.unsubscribe();
          resolve();
        }
      });
    });
  };
  const formSubmittedSuccessfully = useMemo(
    () => status === TransactionStateEnum.SUCCESS,
    [status]
  );
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
            {defaultValues.inputs.map((item: LendInputProps) => {
              // render the initial values so transition can be shown
              const index = controlledFields.findIndex(
                (v: LendInputProps) => v.nft.nId === item.nft.nId
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
                  key={item.nft.nId}
                >
                  <LendItem
                    key={controlledFields[index].id}
                    lendingInput={controlledFields[index]}
                    index={index}
                    register={register}
                    formState={formState}
                    disabled={isSubmitting || formSubmittedSuccessfully}
                    removeFromCart={remove}
                  ></LendItem>
                </Transition>
              );
            })}
          </ul>
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
                isLoading={isSubmitting}
                status={status}
                transactionHashes={transactionHash}
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
        </section>
      </form>
    </div>
  );
};
