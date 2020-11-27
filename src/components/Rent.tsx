import React, { useContext, useState, useEffect, useCallback } from "react";
import { Box } from "@material-ui/core";

import DappContext from "../contexts/Dapp";
// import GraphContext from "../contexts/Graph";
import ContractsContext from "../contexts/Contracts";

import ScrollForMore from "./ScrollForMore";
import Cold from "./Cold";
import RentCatalogue from "./RentCatalogue";
import { Lending } from "../types";
import Switcher from "./Switcher";

type RentProps = {
  hidden: boolean;
};

const Rent: React.FC<RentProps> = ({ hidden }) => {
  const { wallet } = useContext(DappContext);
  // const { user } = useContext(GraphContext);
  const { helpers } = useContext(ContractsContext);
  const { fetchOpenSeaNfts } = helpers;
  const [data, setData] = useState<Lending[]>([]);
  const [showIBorrow, setShowIborrow] = useState(false);

  const handleShowIBorrow = useCallback(() => {
    setShowIborrow((showIBorrow) => !showIBorrow);
  }, []);
  useEffect(() => {
    if (!wallet?.account) {
      console.debug("no wallet or account");
      return;
    }
    fetchOpenSeaNfts(wallet?.account);
    // ! only pulling NFTs where we are not the lender
    // and there is no borrower
    // this query might become heavy eventually (the query behind this data)
    // and I may need to fetch it in multiple calls
    // const resolvedData = nfts.filter(
    //   (item) =>
    //     item.lender !== wallet.account?.toLowerCase() &&
    //     (!showIBorrow
    //       ? item.borrower == null
    //       : item.borrower === wallet.account?.toLowerCase())
    // );
    // setData(resolvedData);
  }, [wallet?.account, showIBorrow, fetchOpenSeaNfts]);

  if (hidden) return <></>;

  return (
    <Box>
      <Box>
        <Box
          style={{
            display: "flex",
          }}
        >
          {data.length > 0 && <ScrollForMore />}
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
      {data.length < 1 && <Cold fancyText="One day it will be warm here..." />}
    </Box>
  );
};

export default Rent;
