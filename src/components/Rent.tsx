import React, {
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { Box, Typography } from "@material-ui/core";

import DappContext from "../contexts/Dapp";
import GraphContext from "../contexts/Graph";

import ScrollForMore from "./ScrollForMore";
import Cold from "./Cold";
import RentCatalogue from "./RentCatalogue";
import { Nft } from "../types";
import Switcher from "./Switcher";

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
  const [showIBorrow, setShowIborrow] = useState(false);
  const dataIsValid = useMemo(() => {
    return isValid(data);
  }, [data]);
  const handleShowIBorrow = useCallback(() => {
    setShowIborrow((showIBorrow) => !showIBorrow);
  }, []);
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
        item.lender !== wallet.account?.toLowerCase() &&
        (!showIBorrow
          ? item.borrower == null
          : item.borrower === wallet.account?.toLowerCase())
    );
    setData(resolvedData);
  }, [nfts, user, wallet, showIBorrow]);

  if (hidden) {
    return <></>;
  }

  return (
    <Box>
      <Box>
        <Box
          style={{
            display: "flex",
          }}
        >
          {dataIsValid && <ScrollForMore />}
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",

              marginLeft: "auto",
            }}
          >
            <span style={{ textTransform: "uppercase", fontWeight: "bold" }}>
              {!showIBorrow ? "ALL" : "BORROWED"} &nbsp; &nbsp;
            </span>
            <Box onClick={handleShowIBorrow}>
              <Switcher />
            </Box>
          </Box>
        </Box>
        <RentCatalogue data={data} iBorrow={showIBorrow} />
      </Box>
      {!dataIsValid && <Cold fancyText="One day it will be warm here..." />}
    </Box>
  );
};

export default Rent;
