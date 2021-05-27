import React, { useCallback, useMemo, useState } from "react";

import { RENFT_SUBGRAPH_ID_SEPARATOR } from "../consts";
import CssTextField from "../components/css-text-field";
import Modal from "./modal";
import { Lending, Nft } from "../contexts/graph/classes";
import { PaymentToken } from "../types";
import { getUniqueID } from "../controller/batch-controller";
import CommonInfo from "./common-info";
import ActionButton from "../components/action-button";
import { useStartRent } from "../hooks/useStartRent";

type BatchRentModalProps = {
  open: boolean;
  handleClose: () => void;
  nft: Lending[];
};

export const BatchRentModal: React.FC<BatchRentModalProps> = ({
  open,
  handleClose,
  nft,
}) => {
  const [duration, setDuration] = useState<Record<string, string>>({});
  const [totalRent, setTotalRent] = useState<Record<string, number>>({});

  const nfts = useMemo(() => {
    return nft.map((nft) => ({
      address: nft.address,
      tokenId: nft.tokenId,
      amount: nft.lending.lentAmount,
      lendingId: nft.lending.id,
      rentDuration: duration[nft.tokenId],
      paymentToken: nft.lending.paymentToken,
    }));
  }, [nft, duration]);

  const { startRent, isApproved, handleApproveAll } = useStartRent(nfts);

  const handleDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const [address, tokenId] = e.target.name.split(
        RENFT_SUBGRAPH_ID_SEPARATOR
      );
      const value = e.target.value || "0";
      const lendingItem = nft.find(
        (x) => x.tokenId === tokenId && x.address === address
      );
      const rent =
        (lendingItem?.lending.nftPrice || 0) +
        (lendingItem?.lending.dailyRentPrice || 0) * Number(value);
      setDuration({
        ...duration,
        [tokenId]: value,
      });
      setTotalRent({
        ...totalRent,
        [tokenId]: rent,
      });
    },
    [nft, duration, totalRent]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isApproved) {
        startRent();
        handleClose();
      }
      if (!isApproved) handleApproveAll();
    },
    [handleApproveAll, handleClose, isApproved, startRent]
  );

  // todo: something wrong in here
  // const isValid = useMemo(
  //   () => nft.length === Object.values(duration).length,
  //   [duration, nft]
  // );

  // TODO close modal when transaction done
  // TODO fix the disabled button, when invalid it should be disabled
  return (
    <Modal open={open} handleClose={handleClose}>
      <form noValidate autoComplete="off" onSubmit={handleSubmit}>
        {nft.map((item: Lending, ix: number) => {
          const token = item.lending.paymentToken;
          const paymentToken = PaymentToken[token];
          const dailyRentPrice = item.lending.dailyRentPrice;
          const nftPrice = item.lending.nftPrice;
          return (
            <CommonInfo
              nft={item}
              key={getUniqueID(item.address, item.tokenId, item.lending.id)}
            >
              <CssTextField
                required
                label={`Rent duration (max duration ${item.lending.maxRentDuration} days)`}
                id={`${item.tokenId}${RENFT_SUBGRAPH_ID_SEPARATOR}duration`}
                variant="outlined"
                type="number"
                name={`${item.address}${RENFT_SUBGRAPH_ID_SEPARATOR}${item.tokenId}`}
                onChange={handleDurationChange}
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
                  {` x ${duration[item.tokenId] || 0} days + ${nftPrice} = ${
                    totalRent[item.tokenId] ? totalRent[item.tokenId] : "? "
                  }`}
                  {` ${paymentToken}`}
                </div>
              </div>
            </CommonInfo>
          );
        })}
        <div className="modal-dialog-button">
          {!isApproved && (
            <button
              type="submit"
              // disabled={!isValid}
              className="nft__button"
            >
              {nft.length > 1 ? "Approve all" : "Approve"}
            </button>
          )}
          {isApproved && (
            <button
              type="submit"
              className="nft__button"
              // disabled={!isValid}
            >
              {nft.length > 1 ? "Rent all" : "Rent"}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default BatchRentModal;
