import React, { useCallback, useState } from "react";
import { Box, Tooltip } from "@material-ui/core";

import { Lending } from "../../types/graph";
import { useRenft } from "../../hooks/useRenft";

type RentButtonProps = {
  handleRent: (lending: Lending) => void;
  lending: Lending;
};

type handleReturnArgs = {
  lending: Lending;
  gasSponsor?: string;
};
type handleReturnFunc = ({ lending, gasSponsor }: handleReturnArgs) => void;

type ReturnButtonProps = {
  handleReturn: handleReturnFunc;
  lending: Lending;
  gasSponsor?: handleReturnArgs["gasSponsor"];
};

type NumericFieldProps = {
  text: string;
  value: string;
  unit: string;
};

// ! this number conversion may fail if non-number is passed
// but since it comes out of blockchain, this should always be correct
const NumericField: React.FC<NumericFieldProps> = ({ text, value, unit }) => (
  <div className="Nft__card">
    <p className="Product__text_overflow">
      <span className="Product__label">{text}</span>
      <Tooltip title={value}>
        <span className="Product__value">{`${unit} ${Number(value).toFixed(
          2
        )}`}</span>
      </Tooltip>
    </p>
  </div>
);

const RentButton: React.FC<RentButtonProps> = ({ handleRent, lending }) => {
  const handleClick = useCallback(() => {
    handleRent(lending);
  }, [handleRent, lending]);

  return (
    <span
      className="Nft__button"
      onClick={handleClick}
      style={{ marginTop: "8px" }}
    >
      Rent now
    </span>
  );
};

const ReturnButton: React.FC<ReturnButtonProps> = ({
  handleReturn,
  lending,
  gasSponsor,
}) => {
  const handleClick = useCallback(() => {
    handleReturn({ lending, gasSponsor });
  }, [lending, gasSponsor, handleReturn]);

  return (
    <span
      className="Nft__button"
      onClick={handleClick}
      style={{ marginTop: "8px" }}
    >
      Return now
    </span>
  );
};

export const AvailableToRent: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { allRentings } = useRenft();

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <Box>
      <Box className="Catalogue">
        {allRentings.map((nft) => {
          const id = `${nft.contract?.address}::${nft.tokenId}`;

          return (
            <div className="Catalogue__item" key={id}>
              <div className="Product" data-item-id={id}>
                <div className="Nft__image">
                  {/* <a href={lending.}>
                      <img alt="nft" src={lending.imageUrl} />
                    </a> */}
                </div>
                <div className="Nft__card">
                  <p className="Product__text_overflow">
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
                  <p className="Product__text_overflow">
                    <span className="Product__label">Token id</span>
                    <span className="Product__value">{nft.tokenId}</span>
                  </p>
                </div>
                {/* <NumericField
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
                /> */}
                <div className="Nft__card">
                  {/* {!iBorrow ? (
                      <RentButton handleRent={handleRent} lending={lending} />
                    ) : (
                      <ReturnButton
                        // handleReturn={handleReturn}
                        lending={lending}
                      />
                    )} */}
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
