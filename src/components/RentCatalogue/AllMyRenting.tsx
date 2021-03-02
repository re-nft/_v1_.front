import React, { useContext } from "react";
import { Box } from "@material-ui/core";

import GraphContext from "../../contexts/Graph";
import { PaymentToken } from "../../types";
import NumericField from "../NumericField";
import CatalogueItem from "../CatalogueItem";

export const AllMyRenting: React.FC = () => {
  const { user } = useContext(GraphContext);
  const { renting } = user;
  return (
    <Box>
      <Box className="Catalogue">
        {renting?.map((nft) => (
          <CatalogueItem
            key={`${nft.address}::${nft.tokenId}`}
            tokenId={nft.tokenId}
            nftAddress={nft.address}
            image={nft.meta?.mediaURI}
          >
            <NumericField
              text="Daily price"
              value={String(nft.lending?.[0].dailyRentPrice)}
              unit={PaymentToken[nft.lending?.[0].paymentToken ?? 0]}
            />
            <NumericField
              text="Rent Duration"
              value={String(nft.renting?.[0].rentDuration)}
              unit="days"
            />
            <div className="Nft__card"></div>
          </CatalogueItem>
        ))}
      </Box>
    </Box>
  );
};

export default AllMyRenting;
