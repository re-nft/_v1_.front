import React, { useContext, useCallback } from "react";
import { Box } from "@material-ui/core";

import GraphContext from "../../contexts/Graph";
import { User } from "../../contexts/Graph/types";
import { PaymentToken } from "../../types";
import NumericField from "../NumericField";
import CatalogueItem from "../CatalogueItem";

export const AllMyRenting: React.FC = () => {
  const { user } = useContext(GraphContext);
  const { rentings } = user;
  return (
    <Box>
      <Box className="Catalogue">
        {rentings.map((nft: RentingAndLending) => {
          const id = `${nft.lending.tokenId}`;
          const lending = nft.lending;
          return (
            <CatalogueItem
              key={id}
              tokenId={nft.lending.tokenId}
              nftAddress={nft.lending.nftAddress}
              // image
            >
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
            </CatalogueItem>
          );
        })}
      </Box>
    </Box>
  );
};

export default AllMyRenting;
