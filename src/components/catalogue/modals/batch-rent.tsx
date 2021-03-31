import React, { useCallback, useState } from "react";
import CssTextField from "../components/css-text-field";
import Modal from "./modal";
import { Lending } from "../../../contexts/graph/classes";

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
      const name = e.target.name;
      const value = e.target.value;
      const lendingItem = nft.find(x => x.tokenId === name);
      setDuration({
        ...duration,
        [name]: value,
      });
      setTotalRent({
        ...totalRent,
        // @ts-ignore
        [name]: Number(lendingItem?.lending.nftPrice + lendingItem?.lending.dailyRentPrice * value),
      })
    },
    [duration, setDuration, totalRent, setTotalRent]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const rentDuration = Object.values(duration);
      onSubmit(nft, { rentDuration });
      handleClose();
    },
    [nft, duration, handleClose, onSubmit]
  );

  return (
    <Modal open={open} handleClose={handleClose}>
      <form noValidate autoComplete="off" onSubmit={handleSubmit}>
          {nft.map((item: Lending) => {
            return (
              <div className="modal-dialog-section" key={`${item.address}::${item.tokenId}`}>
                <div className="modal-dialog-for">
                  <div className="label">Token Id</div>
                  <div className="dot"></div>
                  <div className="label">{item.tokenId}</div>
                </div>
                <div className="modal-dialog-fields">
                  <CssTextField
                    required
                    label={`Rent duration (max duration ${item.lending.maxRentDuration} days)`}
                    id={`${item.tokenId}::duration`}
                    variant="outlined"
                    type="number"
                    name={item.tokenId}
                    onChange={handleChange}
                  />
                  <div className="nft__meta_row">
                    <div className="nft__meta_title">Daily rent price</div>
                    <div className="nft__meta_dot"></div>
                    <div className="nft__meta_value">{item.lending.dailyRentPrice}</div>
                  </div>
                  <div className="nft__meta_row">
                    <div className="nft__meta_title">Rent</div>
                    <div className="nft__meta_dot"></div>
                    <div className="nft__meta_value">
                      {item.lending.dailyRentPrice}
                      {` x ${
                        !duration[item.tokenId] ? "👾" : duration[item.tokenId]
                      } days + ${item.lending.nftPrice} = ${
                        totalRent[item.tokenId]
                          ? totalRent[item.tokenId].toFixed(2)
                          : "👾"
                      }`}
                    </div>
                  </div>
                  <div className="nft__meta_row">
                    <div className="nft__meta_title">Collateral</div>
                    <div className="nft__meta_dot"></div>
                    <div className="nft__meta_value">{item.lending.nftPrice}</div>
                  </div>
                </div>
              </div>
            );
          })}
        <div className="modal-dialog-button">
          <button type="submit" className="nft__button">{nft.length > 1 ? 'Rent all' : 'Rent'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default BatchRentModal;
