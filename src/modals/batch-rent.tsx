import React, { useCallback, useState } from "react";

import { RENFT_SUBGRAPH_ID_SEPARATOR } from "../consts";
import CssTextField from "../components/css-text-field";
import Modal from "./modal";
import { Lending } from "../contexts/graph/classes";
import { PaymentToken } from "../types";
import { getLendingPriceByCurreny } from "../utils";

type BatchRentModalProps = {
  open: boolean;
  handleClose: () => void;
  nft: Lending[];
  onSubmit(nft: Lending[], options: { rentDuration: string[] }): void;
};

export const BatchRentModal: React.FC<BatchRentModalProps> = ({
  open,
  handleClose,
  nft,
  onSubmit,
}) => {
  const [duration, setDuration] = useState<Record<string, string>>({});
  const [totalRent, setTotalRent] = useState<Record<string, number>>({});

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const [address, tokenId] = e.target.name.split(RENFT_SUBGRAPH_ID_SEPARATOR);
      const value = e.target.value || "0";
      const lendingItem = nft.find(
        (x) => x.tokenId === tokenId && x.address === address
      );
      const nftPrice =
        (lendingItem?.lending.nftPrice || 0) +
        (lendingItem?.lending.dailyRentPrice || 0);
      setDuration({
        ...duration,
        [tokenId]: value,
      });
      setTotalRent({
        ...totalRent,
        [tokenId]: Number(nftPrice) * Number(value),
      });
    },
    [duration, setDuration, totalRent, setTotalRent, nft]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const rentDuration = Object.values(duration);
      onSubmit(nft, { rentDuration });
    },
    [nft, duration, onSubmit]
  );

  const isValid = nft.length === Object.values(duration).length;

  return (
    <Modal open={open} handleClose={handleClose}>
      <form noValidate autoComplete="off" onSubmit={handleSubmit}>
        {nft.map((item: Lending) => {
          const token = item.lending.paymentToken;
          const paymentToken = PaymentToken[token];
          const dailyRentPrice = getLendingPriceByCurreny(
            item.lending.dailyRentPrice,
            token
          );
          const nftPrice = getLendingPriceByCurreny(
            item.lending.nftPrice,
            token
          );
          return (
            <div
              className="modal-dialog-section"
              key={`${item.address}${RENFT_SUBGRAPH_ID_SEPARATOR}${item.tokenId}`}
            >
              <div className="modal-dialog-for">
                <div className="label">Token Id</div>
                <div className="dot"></div>
                <div className="label">{item.tokenId}</div>
              </div>
              <div className="modal-dialog-fields">
                <CssTextField
                  required
                  label={`Rent duration (max duration ${item.lending.maxRentDuration} days)`}
                  id={`${item.tokenId}${RENFT_SUBGRAPH_ID_SEPARATOR}duration`}
                  variant="outlined"
                  type="number"
                  name={`${item.address}${RENFT_SUBGRAPH_ID_SEPARATOR}${item.tokenId}`}
                  onChange={handleChange}
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
                    {` x ${
                      !duration[item.tokenId] ? "?" : duration[item.tokenId]
                    } days + ${nftPrice} = ${
                      totalRent[item.tokenId]
                        ? getLendingPriceByCurreny(
                            totalRent[item.tokenId],
                            token
                          )
                        : "? "
                    }`}
                    {` ${paymentToken}`}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div className="modal-dialog-button">
          <button
            type="submit"
            className={`nft__button ${!isValid && "disabled"}`}
          >
            {nft.length > 1 ? "Rent all" : "Rent"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BatchRentModal;
