import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import { TransactionStateEnum } from "../../../types";
import {
  StartRentNft,
  useStartRent
} from "../../../hooks/contract/useStartRent";
import { TransactionWrapper } from "../../transaction-wrapper";
import { Transition } from "@headlessui/react";
import { FormProps, LendFormProps } from "./rent-types";
import { RentItem } from "./rent-item";
import { validationSchema } from "./rent-validate";
import { Button } from "../../common/button";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLendingStore } from "../../../hooks/store/useNftStore";

export const RentForm: React.FC<LendFormProps> = ({ checkedItems, onClose }) => {
  const {
    startRent: handleSave,
    isApproved,
    handleApproveAll,
    checkApprovals,
    approvalStatus
  } = useStartRent();

  const selectedToRent = useLendingStore(
    useCallback(
      (state) => {
        return Object.values(state.lendings).filter((l) => checkedItems.has(l.id));
      },
      [checkedItems]
    )
  );
  useEffect(() => {
    checkApprovals(
      selectedToRent
    );
  }, [checkApprovals, selectedToRent]);

  const defaultValues: FormProps = {
    inputs: selectedToRent
  };
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
      const sub = handleSave(
        values.inputs.map<StartRentNft>((lending) => ({
          address: lending.nftAddress,
          tokenId: lending.tokenId,
          amount: lending.lentAmount,
          lendingId: lending.id,
          rentDuration: lending.duration || "",
          paymentToken: lending.paymentToken,
          isERC721: lending.isERC721
        }))
      ).subscribe({
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
        NFTs to rent
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col space-y-12 mt-4"
      >
        <section aria-labelledby="cart-heading">
          <h2 id="cart-heading" className="sr-only">
            NFTs in your renting cart
          </h2>
          <ul role="list" className="flex flex-col space-y-8  ">
            {defaultValues.inputs.map((item) => {
              // render the initial values so transition can be shown
              const index = controlledFields.findIndex(
                (v) => v.nId === item.nId
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
                    item={controlledFields[index]}
                    formState={formState}
                    register={register}
                    removeFromCart={remove}
                    index={index}
                    disabled={formSubmittedSuccessfully}
                  ></RentItem>
                </Transition>
              );
            })}

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
                  isLoading={isSubmitting}
                  status={status}
                  closeWindow={onClose}
                  transactionHashes={transactionHash}
                >
                  <Button
                    description={selectedToRent.length > 1 ? "Rent all" : "Rent"}
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
          </ul>
        </section>
      </form>
    </div>
  );
};
