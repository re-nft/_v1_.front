import CssTextField from "../components/css-text-field";

import ActionButton from "../components/action-button";
import { getUniqueID } from "../controller/batch-controller";
import { Lending, Nft } from "../contexts/graph/classes";
import React from "react";
import CommonInfo from "../modals/common-info";
import { Formik, FormikErrors, FormikTouched, FieldArray } from "formik";
import { PaymentToken } from "../types";
import { StartRentNft } from "../hooks/useStartRent";

type LendFormProps = {
  nfts: Lending[];
  isApproved: boolean;
  handleApproveAll: () => void;
  handleSubmit: (arg: StartRentNft[]) => void;
};
interface LendingWithKey extends Lending {
  key: string;
  duration: number | undefined;
}
export const RentForm: React.FC<LendFormProps> = ({
  nfts,
  isApproved,
  handleApproveAll,
  handleSubmit,
}) => {
  const [nft] = nfts;
  const initialValues = {
    inputs: nfts.map<LendingWithKey>((nft) => ({
      key: getUniqueID(nft.address, nft.tokenId),
      duration: undefined,
      ...nft,
    })),
  };
  const onSubmit = (values: { inputs: LendingWithKey[] }) => {
    console.log(values.inputs);
    handleSubmit(
      values.inputs.map<StartRentNft>((nft) => ({
        address: nft.address,
        tokenId: nft.tokenId,
        amount: nft.lending.lentAmount,
        lendingId: nft.lending.id,
        rentDuration: (nft.duration as number).toString(),
        paymentToken: nft.lending.paymentToken,
      }))
    );
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
      }
      errors[index] = Object.keys(error).length > 0 ? error : undefined;
    });
    const valid = errors.filter((e) => e !== undefined).length < 1;
    if (valid) return;
    return { inputs: errors };
  };
  return (
    <Formik
      onSubmit={onSubmit}
      initialValues={initialValues}
      validate={validate}
      validateOnMount
      validateOnBlur
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
      }) => {
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
                      ></ModalDialogSection>
                    );
                  }
                );
              }}
            </FieldArray>

            <div className="modal-dialog-button">
              {!isApproved && (
                <ActionButton<Nft>
                  title="Approve all"
                  nft={nft}
                  onClick={handleApproveAll}
                  disabled={!isValid || isSubmitting}
                />
              )}
              {isApproved && (
                <ActionButton<Nft>
                  title={nfts.length > 1 ? "Rent all" : "Rent"}
                  nft={nft}
                  onClick={submitForm}
                  disabled={!isValid || isSubmitting}
                />
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
}> = ({ item, index, handleChange, handleBlur, errors, touched }) => {
  const token = item.lending.paymentToken;
  const paymentToken = PaymentToken[token];
  const dailyRentPrice = item.lending.dailyRentPrice;
  const nftPrice = item.lending.nftPrice;
  const totalRent =
    (item.lending.nftPrice || 0) +
    (item.lending.dailyRentPrice || 0) * Number(item.duration);
  return (
    <CommonInfo
      nft={item}
      key={getUniqueID(item.address, item.tokenId, item.lending.id)}
    >
      <CssTextField
        required
        label={`Rent duration (max duration ${item.lending.maxRentDuration} days)`}
        variant="outlined"
        type="number"
        name={`inputs.${index}.duration`}
        onChange={handleChange}
        onBlur={handleBlur}
        error={
          !!touched && touched.duration && Boolean(errors && errors.duration)
        }
        helperText={touched && touched.duration && errors && errors.duration}
      />
      <div className="nft__meta_row">
        <div className="nft__meta_title">Daily rent price</div>
        <div className="nft__meta_dot"></div>
        <div className="nft__meta_value">
          {dailyRentPrice} {paymentToken}
        </div>
      </div>
      <div className="nft__meta_row">
        <div className="nft__meta_title">Collateral</div>
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
          {` x ${item.duration ? item.duration : 0} days + ${nftPrice} = ${
            totalRent ? totalRent : "? "
          }`}
          {` ${paymentToken}`}
        </div>
      </div>
    </CommonInfo>
  );
};
