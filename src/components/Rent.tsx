import React, { useState, useContext, useCallback, useEffect } from "react";
import { Box } from "@material-ui/core";

import ScrollForMore from "./ScrollForMore";
import Cold from "./Cold";
import RentCatalogue from "./RentCatalogue";
import Switcher from "./Switcher";

type RentProps = {
  hidden: boolean;
};

const Rent: React.FC<RentProps> = ({ hidden }) => {
  // const { helpers } = useContext(ContractsContext);
  // const { openSeaNfts, nonOpenSeaNfts } = helpers;
  const [showIBorrow, setShowIborrow] = useState(false);
  const [cold, setCold] = useState(true);

  const handleShowIBorrow = useCallback(() => {
    setShowIborrow((showIBorrow) => !showIBorrow);
  }, []);

  // const nfts = useMemo(() => {
  //   return openSeaNfts.concat(nonOpenSeaNfts);
  // }, [openSeaNfts, nonOpenSeaNfts]);

  if (hidden) return <></>;

  // todo: a bit inefficient to be fetching the nfts here, and then also inside
  // of the RentCatalogue
  return (
    <Box>
      <Box>
        <Box
          style={{
            display: "flex",
          }}
        >
          {!cold && <ScrollForMore />}
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginLeft: "auto",
            }}
          >
            <span style={{ textTransform: "uppercase", fontWeight: "bold" }}>
              {!showIBorrow ? "ALL" : "RENTING"} &nbsp; &nbsp;
            </span>
            <Box onClick={handleShowIBorrow}>
              <Switcher />
            </Box>
          </Box>
        </Box>
        <RentCatalogue iBorrow={showIBorrow} setCold={setCold} />
      </Box>
      {cold && <Cold fancyText="One day it will be warm here..." />}
    </Box>
  );
};

export default Rent;
