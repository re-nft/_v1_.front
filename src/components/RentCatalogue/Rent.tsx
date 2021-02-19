import React, { useState, useCallback } from "react";
import { Box } from "@material-ui/core";

// import Cold from "../Cold";
import Toggle from "../Toggle";
import { AvailableToRent } from "./AvailableToRent";

type RentProps = {
  hidden: boolean;
};

export const Rent: React.FC<RentProps> = ({ hidden }) => {
  // const [cold, setCold] = useState(true);

  if (hidden) return <></>;

  return (
    <Box>
      <Box>
        <AvailableToRent />
      </Box>
      {/* {cold && <Cold fancyText="One day it will be warm here..." />} */}
    </Box>
  );
};

export default Rent;
