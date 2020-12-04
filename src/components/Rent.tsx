import React, { useContext, useState, useCallback, useMemo } from "react";
import { Box } from "@material-ui/core";

import ContractsContext from "../contexts/Contracts";
import GraphContext from "../contexts/GraphContext";

import ScrollForMore from "./ScrollForMore";
import Cold from "./Cold";
import RentCatalogue from "./RentCatalogue";
import Switcher from "./Switcher";

type RentProps = {
  hidden: boolean;
};

const Rent: React.FC<RentProps> = ({ hidden }) => {
  const { helpers } = useContext(ContractsContext);
  const { openSeaNfts, nonOpenSeaNfts } = helpers;
  const [showIBorrow, setShowIborrow] = useState(false);

  const handleShowIBorrow = useCallback(() => {
    setShowIborrow((showIBorrow) => !showIBorrow);
  }, []);

  const nfts = useMemo(() => {
    return openSeaNfts.concat(nonOpenSeaNfts);
  }, [openSeaNfts, nonOpenSeaNfts]);

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
              {!showIBorrow ? "ALL" : "RENTING"} &nbsp; &nbsp;
            </span>
            <Box onClick={handleShowIBorrow}>
              <Switcher />
            </Box>
          </Box>
        </Box>
        <RentCatalogue iBorrow={showIBorrow} />
      </Box>
      {nfts.length < 1 && <Cold fancyText="One day it will be warm here..." />}
    </Box>
  );
};

export default Rent;
