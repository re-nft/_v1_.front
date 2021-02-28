import React, { useContext, useCallback } from "react";
import { Box, Tooltip } from "@material-ui/core";

import GraphContext from "../../contexts/Graph";
import { RentingAndLending } from "../../types/graph";
import { PaymentToken } from "../../types";

type NumericFieldProps = {
  text: string;
  value: string;
  unit?: string;
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

export const AllMyRenting: React.FC = () => {
  const { user } = useContext(GraphContext);
  const { rentings } = user;
  console.log(rentings);
  return (
    <Box>
      <Box className="Catalogue">
        {rentings.map((nft: RentingAndLending) => {
          const id = `${nft.lending.tokenId}`;
          const lending = nft.lending;
          return (
            <div className="Nft__item" key={id}>
              <div className="Nft" data-item-id={id}>
                <div className="Nft__image">
                  {/*<a href={nft.image}>
                    <img alt="nft" src={nft.image} />
                  </a>*/}
                </div>
                <div className="Nft__card">
                  <p className="Nft__text_overflow">
                    <a
                      href={`https://goerli.etherscan.io/address/${lending.nftAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: "none", color: "black" }}
                    >
                      {lending.nftAddress}
                    </a>
                  </p>
                </div>
                <div className="Nft__card">
                  <p className="Nft__text_overflow">
                    <span className="Nft__label">Token id</span>
                    <span className="Nft__value">{nft.lending.tokenId}</span>
                  </p>
                </div>
                <NumericField
                  text="Daily price"
                  value={String(lending.dailyRentPrice)}
                  unit={PaymentToken[lending.paymentToken]}
                />
                <NumericField
                  text="Rent Duration"
                  value={String(nft.rentDuration)}
                  unit="days"
                />
                <div className="Nft__card"></div>
              </div>
            </div>
          );
        })}
      </Box>
    </Box>
  );
};

export default AllMyRenting;
