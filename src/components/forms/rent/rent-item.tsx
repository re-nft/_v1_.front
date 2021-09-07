import XIcon from "@heroicons/react/solid/XIcon";
import { PaymentToken } from "@renft/sdk";
import React, { Ref, useCallback } from "react";
import shallow from "zustand/shallow";
import { useNftMetaState } from "../../../hooks/queries/useMetaState";
import { CatalogueItemDisplay } from "../../catalogue-item/catalogue-item-display";
import { CatalogueItemRow } from "../../catalogue-item/catalogue-item-row";
import { TextField } from "../../common/text-field";
import ModalFields from "../../modals/modal-fields";
import { RentItemProps } from "./rent-types";

export const RentItem: React.FC<RentItemProps> = React.forwardRef(
  (props, ref) => {
    const {
      item,
      index,
      handleChange,
      handleBlur,
      errors,
      touched,
      disabled,
      removeFromCart,
    } = props;
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
