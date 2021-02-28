import React, { useCallback, useState, useContext } from "react";
import { Box, Tooltip } from "@material-ui/core";
import { DP18 } from "../../consts";
import { useRenft } from "../../hooks/useRenft";
import {
  CurrentAddressContext,
  RentNftContext,
} from "../../hardhat/SymfoniContext";
import { RentButton } from "./RentButton";
import { RentModal } from "../RentModal";
import { NftAndLendingId, PaymentToken } from "../../types";

type NumericFieldProps = {
  text: string;
  value: string;
  unit: string;
};

// ! this number conversion may fail if non-number is passed
// but since it comes out of blockchain, this should always be correct
const NumericField: React.FC<NumericFieldProps> = ({ text, value, unit }) => (
  <div className="Nft__card">
    <p className="Nft__text_overflow">
      <span className="Nft__label">{text}</span>
      <Tooltip title={value}>
        <span className="Nft__value">{`${unit} ${Number(value).toFixed(
          2
        )}`}</span>
      </Tooltip>
    </p>
  </div>
);

export const AvailableToRent: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNft, setSelectedNft] = useState<NftAndLendingId>();
  const { allRentings } = useRenft();
  const [currentAddress] = useContext(CurrentAddressContext);
  const { instance: renft } = useContext(RentNftContext);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  const computeEthAmount = (rentDuration: number, dailyPrice: number) => {
    return 0;
  };

  const handleRent = useCallback(
    async (nft: NftAndLendingId) => {
      // need contract instance
      // for that need renft context from symfoni
      // and currentAddress from currentaddress context from symfoni
      // if (!currentAddress || !renft || !nft.contract?.address) return;
      // // todo: for how long to rent, pull that
      // // todo: approve the erc20 if not approved
      // // for eth payments, need to also supply the amount in overrides
      // await renft.rent(
      //   [nft.contract?.address],
      //   [nft.tokenId],
      //   [nft.lendingId],
      //   [nft.lendingRentInfo.maxRentDuration]
      // );
      setSelectedNft(nft);
      setModalOpen(true);
    },
    [renft, currentAddress]
  );

  return (
    <Box>
      {selectedNft && (
        <RentModal
          nft={selectedNft}
          open={modalOpen}
          handleClose={handleModalClose}
        />
      )}
      <Box className="Catalogue">
        {allRentings.map((nft: NftAndLendingId) => {
          const id = `${nft.tokenId}`;
          const lending = nft.lendingRentInfo;
          // const id = `${nft.contract?.address}::${nft.tokenId}`;
          return (
            <div className="Nft__item" key={id}>
              <div className="Nft" data-item-id={id}>
                <div className="Nft__image">
                  <a href={nft.image}>
                    <img alt="nft" src={nft.image} />
                  </a>
                </div>
                <div className="Nft__card">
                  <p className="Nft__text_overflow">
                    <a
                      href={`https://goerli.etherscan.io/address/${nft.contract?.address}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: "none", color: "black" }}
                    >
                      {nft.contract?.address}
                    </a>
                  </p>
                </div>
                <div className="Nft__card">
                  <p className="Nft__text_overflow">
                    <span className="Nft__label">Token id</span>
                    <span className="Nft__value">{nft.tokenId}</span>
                  </p>
                </div>
                <NumericField
                  text="Daily price"
                  value={String(lending.dailyRentPrice)}
                  unit={PaymentToken[lending.paymentToken]}
                />
                <NumericField
                  text="Max duration"
                  value={String(lending.maxRentDuration)}
                  unit="days"
                />
                <NumericField
                  text="Collateral"
                  value={String(lending.nftPrice)}
                  unit={PaymentToken[lending.paymentToken]}
                />
                <div className="Nft__card">
                  <RentButton handleRent={handleRent} nft={nft} />
                </div>
              </div>
            </div>
          );
        })}
      </Box>
    </Box>
  );
};

export default AvailableToRent;
