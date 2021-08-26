import { TextField } from "../common/text-field";

import ActionButton from "../common/action-button";
import { Lending, Nft } from "../../contexts/graph/classes";
import React from "react";
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
          <form onSubmit={handleSubmit}>
            <FieldArray name="inputs">
              {() => {
                return values.inputs.map(
                  (item: LendingWithKey, index: number) => {
                    return (
                      <ModalDialogSection
                        key={item.key}
                        item={item}
                        index={index}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        touched={touched.inputs ? touched.inputs[index] : null}
                        errors={
                          errors.inputs
                            ? (errors.inputs[
                                index
                              ] as FormikErrors<LendingWithKey>)
                            : null
                        }
                        disabled={formSubmittedSuccessfully}
                      ></ModalDialogSection>
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
          </form>
        );
      }}
    </Formik>
  );
};

const ModalDialogSection: React.FC<{
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
  index: number;
  touched: FormikTouched<LendingWithKey> | null;
  errors: FormikErrors<LendingWithKey> | null;
  disabled: boolean;
}> = ({ item, index, handleChange, handleBlur, errors, touched, disabled }) => {
  const token = item.lending.paymentToken;
  const paymentToken = PaymentToken[token];
  const dailyRentPrice = item.lending.dailyRentPrice;
  const nftPrice = item.lending.nftPrice;
  const duration = item.lending.duration;
  const totalRent =
    (item.lending.nftPrice || 0) * Number(item.amount) +
    (item.lending.dailyRentPrice || 0) * Number(item.duration);

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
    <ModalFields nft={item} key={item.id}>
      <CatalogueItemRow text="Rent Amount" value={item.amount} />
      <TextField
        required
        label={renderItem()}
        value={duration || ""}
        name={`inputs.${index}.duration`}
        onChange={handleChange}
        onBlur={handleBlur}
        error={
          !!touched && touched.duration && Boolean(errors && errors.duration)
        }
        helperText={touched && touched.duration && errors && errors.duration}
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
  );
};
