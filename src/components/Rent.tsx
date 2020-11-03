import React, { useContext, useState, useMemo, useEffect } from "react";
import { Box } from "@material-ui/core";

import DappContext from "../contexts/Dapp";
import GraphContext from "../contexts/Graph";

import ScrollForMore from "./ScrollForMore";
import Cold from "./Cold";
import RentCatalogue from "./RentCatalogue";
import { Nft } from "../types";

type RentProps = {
  hidden: boolean;
};

const Rent: React.FC<RentProps> = ({ hidden }) => {
  const isValid = (data?: Nft[]) => {
    return data != null && data.length > 0;
  };

  const { wallet } = useContext(DappContext);
  const { nfts, user } = useContext(GraphContext);
  const [data, setData] = useState<Nft[]>();
  const dataIsValid = useMemo(() => {
    return isValid(data);
  }, [data]);
  useEffect(() => {
    if (!nfts || !wallet || !wallet.account) {
      console.debug("no nfts or wallet or account");
      return;
    }
    // ! only pulling NFTs where we are not the lender
    // and there is no borrower
    // this query might become heavy eventually (the query behind this data)
    // and I may need to fetch it in multiple calls
    const resolvedData = nfts.filter(
      (item) =>
        item.lender !== wallet.account!.toLowerCase() && item.borrower == null
    );
    setData(resolvedData);
  }, [nfts, user, wallet]);

  if (hidden) {
    return <></>;
  }

  return (
    <Box>
      {dataIsValid && (
        <Box>
          <ScrollForMore />
          <RentCatalogue data={data} />
        </Box>
      )}
      {!dataIsValid && <Cold fancyText="One day it will be warm here..." />}
    </Box>
  );
};

export default Rent;
