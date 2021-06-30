import CssTextField from "../components/css-text-field";

import ActionButton from "../components/action-button";
import { getUniqueCheckboxId } from "../controller/batch-controller";
import { Lending, Nft } from "../contexts/graph/classes";
import React from "react";
import CommonInfo from "../modals/common-info";
import {
  Formik,
  FormikErrors,
  FormikTouched,
  FieldArray,
  FormikBag,
} from "formik";
import { PaymentToken, TransactionStateEnum } from "../types";
import { StartRentNft } from "../hooks/useStartRent";
import { normalizeFloat } from "../utils";
import { TransactionWrapper } from "../components/transaction-wrapper";

type LendFormProps = {
  nfts: Lending[];
  isApproved: boolean;
  handleApproveAll: () => void;
  handleSubmit: (arg: StartRentNft[]) => Promise<[boolean | void, ()=>void]>;
  isApprovalLoading: boolean;
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
  isApprovalLoading,
}) => {
  const [nft] = nfts;
  const initialValues: FormProps = {
    inputs: nfts.map<LendingWithKey>((nft) => ({
      key: getUniqueCheckboxId(nft),
      duration: undefined,
      ...nft,
    })),
  };

  const onSubmit = (
    values: FormProps,
    { setSubmitting, setStatus }: FormikBag<FormProps, unknown>
  ) => {
    setSubmitting(true);
    setStatus([TransactionStateEnum.PENDING])
    handleSubmit(
      values.inputs.map<StartRentNft>((nft) => ({
        address: nft.address,
        tokenId: nft.tokenId,
        amount: nft.lending.lentAmount,
        lendingId: nft.lending.id,
        rentDuration: (nft.duration as number).toString(),
        paymentToken: nft.lending.paymentToken,
      }))
    )
      .then(([status, closeWindow]) => {
        setSubmitting(false);
        setStatus([status? TransactionStateEnum.SUCCESS: TransactionStateEnum.FAILED, closeWindow])
      })
      .catch(() => {
        setSubmitting(false);
        setStatus([TransactionStateEnum.FAILED])
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
      } else if (input.duration !== parseInt(input.duration.toString(), 10)) {
        error.duration = "maxDuration must be a whole number";
      }
      errors[index] = Object.keys(error).length > 0 ? error : undefined;
    });
    const valid = errors.filter((e) => e !== undefined).length < 1;
    if (valid) return;
    return { inputs: errors };
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
        const formSubmittedSuccessfully = status && status[0] === TransactionStateEnum.SUCCESS
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

            <div className="modal-dialog-button">
              {!isApproved && !isSubmitting && (
                <TransactionWrapper isLoading={isApprovalLoading} status={TransactionStateEnum.PENDING} >
                  <ActionButton<Nft>
                    title="Approve Payment tokens"
                    nft={nft}
                    onClick={handleApproveAll}
                    disabled={isApprovalLoading || isSubmitting}
                  />
                </TransactionWrapper>
              )}
              {(isApproved || isSubmitting) && (
                <TransactionWrapper isLoading={isSubmitting} status={status[0]} closeWindow={status[1]}>
                  <ActionButton<Nft>
                    title={nfts.length > 1 ? "Rent all" : "Rent"}
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
}> = ({ item, index, handleChange, handleBlur, errors, touched , disabled}) => {
  const token = item.lending.paymentToken;
  const paymentToken = PaymentToken[token];
  const dailyRentPrice = item.lending.dailyRentPrice;
  const nftPrice = item.lending.nftPrice;
  const totalRent = normalizeFloat(
    (item.lending.nftPrice || 0) * Number(item.amount) +
      (item.lending.dailyRentPrice || 0) * Number(item.duration)
  );

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
    <CommonInfo nft={item} key={getUniqueCheckboxId(item)}>
      <div className="modal-dialog-for">
        <div className="label">Rent Amount</div>
        <div className="dot"></div>
        {/* we can do this because checked items will have the right amount when we pass them here */}
        <div className="label">{item.amount}</div>
      </div>
      <CssTextField
        required
        label={renderItem()}
        variant="outlined"
        type="number"
        name={`inputs.${index}.duration`}
        onChange={handleChange}
        onBlur={handleBlur}
        error={
          !!touched && touched.duration && Boolean(errors && errors.duration)
        }
        helperText={touched && touched.duration && errors && errors.duration}
        disabled={disabled}
      />
      <div className="nft__meta_row">
        <div className="nft__meta_title">Daily rent price</div>
        <div className="nft__meta_dot"></div>
        <div className="nft__meta_value">
          {dailyRentPrice} {paymentToken}
        </div>
      </div>
      <div className="nft__meta_row">
        <div className="nft__meta_title">Collateral (per item)</div>
        <div className="nft__meta_dot"></div>
        <div className="nft__meta_value">
          {nftPrice} {paymentToken}
        </div>
      </div>
      <div className="nft__meta_row">
        <div className="nft__meta_title">
          <b>Rent</b>
        </div>
        <div className="nft__meta_dot"></div>
        <div className="nft__meta_value">
          {dailyRentPrice}
          {` x ${item.duration ? item.duration : 0} days + ${Number(
            nftPrice
          )} x ${Number(item.amount)} = ${totalRent ? totalRent : "? "}`}
          {` ${paymentToken}`}
        </div>
      </div>
    </CommonInfo>
  );
};
