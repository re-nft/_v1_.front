import React, { useContext, useState, useMemo, useEffect } from "react";
import { Box } from "@material-ui/core";

// contexts
import DappContext from "../contexts/Dapp";
import GraphContext from "../contexts/Graph";

import ScrollForMore from "./ScrollForMore";
import Cold from "./Cold";
import Catalogue from "./Catalogue";

import { Face, Nft } from "../types";

type PsychedelicProps = {
  children?: React.ReactNode;
  hidden: boolean;
  isRent: boolean;
};

const Psychedelic: React.FC<PsychedelicProps> = ({ hidden, isRent }) => {
  const btnLbl = isRent === true ? "Rent" : "Lend";
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
    if (isRent) {
      // * filter step removes YOUR lent NFTs
      const resolvedData = nfts.filter(
        (item) => item.lender !== wallet.account!.toLowerCase()
      );
      setData(resolvedData);
      return;
    }
    // lend
    if (user == null || wallet == null || !wallet.account) {
      console.debug("no user data yet");
      return;
    }
    const currentLending = user.lending.map((item) => item.id);
    // TODO: O(N**2) time complexity is shit
    const resolvedData = user.faces.filter(
      (item) => !currentLending.includes(item.id)
    );
    setData(resolvedData);
  }, [nfts, user, isRent, wallet]);

  if (hidden) {
    return <></>;
  }

  return (
    <Box>
      {dataIsValid && (
        <Box>
          <ScrollForMore />
          <Catalogue data={data} btnActionLabel={btnLbl} />
        </Box>
      )}
      {!dataIsValid && <Cold fancyText="One day it will be warm here..." />}
    </Box>
  );
};

export default Psychedelic;
