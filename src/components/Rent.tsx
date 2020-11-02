import React, { useContext, useState, useMemo, useEffect } from "react";
import { Box } from "@material-ui/core";

// contexts
import DappContext from "../contexts/Dapp";
import GraphContext from "../contexts/Graph";

import ScrollForMore from "./ScrollForMore";
import Cold from "./Cold";
import Catalogue from "./Catalogue";

import { Face, Nft } from "../types";

type RentProps = {
  hidden: boolean;
};

const Rent: React.FC<RentProps> = ({ hidden }) => {
  const isValid = (data?: Face[] | Nft[]) => {
    return data != null && data.length > 0;
  };

  const { wallet } = useContext(DappContext);
  const { nfts, user } = useContext(GraphContext);
  const [data, setData] = useState<Face[] | Nft[]>();
  const dataIsValid = useMemo(() => {
    return isValid(data);
  }, [data]);
  useEffect(() => {
    if (nfts == null || wallet == null || !wallet.account) {
      return;
    }
    const resolvedData = nfts.filter((item) => {
      console.error(item);
      console.error(wallet.account);
      console.error(wallet.account!.toLowerCase());
      return item.lender !== wallet.account!.toLowerCase();
    });
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
          <Catalogue data={data} btnActionLabel="Rent" />
        </Box>
      )}
      {!dataIsValid && <Cold fancyText="One day it will be warm here..." />}
    </Box>
  );
};

export default Rent;
