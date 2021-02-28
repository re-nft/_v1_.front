import React, { useContext, useCallback } from "react";
import { Box } from "@material-ui/core";

import GraphContext from "../../contexts/Graph";

export const AllMyRenting: React.FC = () => {
  const { user } = useContext(GraphContext);
  const { rentings } = user;

  return (
    <Box>
      <Box className="Catalogue">
        {/*rentings.map((nft) => {
            const nftId = `${nft.contract?.address ?? ""}::${nft.tokenId}`;
            return <CatalogueItem key={nftId} nftId={nftId} nft={nft} />;
          })*/}
      </Box>
    </Box>
  );
};

export default AllMyRenting;
