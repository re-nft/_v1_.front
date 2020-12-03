import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Box } from "@material-ui/core";

import DappContext from "../contexts/Dapp";
import ContractsContext from "../contexts/Contracts";

import ScrollForMore from "./ScrollForMore";
import Cold from "./Cold";
import RentCatalogue from "./RentCatalogue";
import Switcher from "./Switcher";

type RentProps = {
  hidden: boolean;
};

const Rent: React.FC<RentProps> = ({ hidden }) => {
  const { wallet } = useContext(DappContext);
  const { helpers } = useContext(ContractsContext);
  const { openSeaNfts, nonOpenSeaNfts } = helpers;
  const [showIBorrow, setShowIborrow] = useState(false);

  const handleShowIBorrow = useCallback(() => {
    setShowIborrow((showIBorrow) => !showIBorrow);
  }, []);

  useEffect(() => {
    // ! only pulling NFTs where we are not the lender
    // const resolvedData = nfts.filter(
    //   (item) =>
    //     item.lender !== wallet.account?.toLowerCase() &&
    //     (!showIBorrow
    //       ? item.borrower == null
    //       : item.borrower === wallet.account?.toLowerCase())
    // );
    // setData(resolvedData);
  }, [wallet?.account, showIBorrow]);

  const nfts = useMemo(() => {
    return openSeaNfts.concat(nonOpenSeaNfts);
  }, [openSeaNfts, nonOpenSeaNfts]);

  if (hidden) return <></>;

  return (
    <Box>
      <Box>
        <Box
          style={{
            display: "flex",
          }}
        >
          {nfts.length > 0 && <ScrollForMore />}
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
        <RentCatalogue nfts={nfts} iBorrow={showIBorrow} />
      </Box>
      {nfts.length < 1 && <Cold fancyText="One day it will be warm here..." />}
    </Box>
  );
};

export default Rent;
