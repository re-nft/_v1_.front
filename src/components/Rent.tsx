import React, { useState, useCallback } from "react";
import { Box } from "@material-ui/core";

import ScrollForMore from "./ScrollForMore";
import Cold from "./Cold";
import RentCatalogue from "./RentCatalogue";
import Toggle from "./Toggle";

type RentProps = {
  hidden: boolean;
};

const Rent: React.FC<RentProps> = ({ hidden }) => {
  const [showIBorrow, setShowIborrow] = useState(false);
  const [cold, setCold] = useState(true);

  const handleShowIBorrow = useCallback(() => {
    setShowIborrow((showIBorrow) => !showIBorrow);
  }, []);

  if (hidden) return <></>;

  return (
    <Box>
      <Box>
        <Box
          style={{
            display: "flex",
          }}
        >
          {!cold && <ScrollForMore />}
          {!cold && (
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
                <Toggle isOn={!showIBorrow} />
              </Box>
            </Box>
          )}
        </Box>
        <RentCatalogue iBorrow={showIBorrow} setCold={setCold} />
      </Box>
      {cold && <Cold fancyText="One day it will be warm here..." />}
    </Box>
  );
};

export default Rent;
