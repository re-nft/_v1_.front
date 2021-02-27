import React, { useState, useCallback } from "react";
import { Box } from "@material-ui/core";

// import Cold from "../Cold";
import Toggle from "../Toggle";
import { AvailableToRent } from "./AvailableToRent";
import { AllMyRenting } from "./AllMyRenting";

type RentProps = {
  hidden: boolean;
};

enum RentSpecificity {
  ALL,
  RENTING,
}

export const Rent: React.FC<RentProps> = ({ hidden }) => {
  const [specificity, setSpecificiy] = useState<RentSpecificity>(
    RentSpecificity.ALL
  );

  const switchSpecificity = useCallback(() => {
    setSpecificiy((specificity) =>
      specificity === RentSpecificity.ALL
        ? RentSpecificity.RENTING
        : RentSpecificity.ALL
    );
  }, []);

  if (hidden) return <></>;

  return (
    <Box>
      <Box>
        <Box style={{ display: "flex" }}>
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginLeft: "auto",
            }}
          >
            <span style={{ textTransform: "uppercase", fontWeight: "bold" }}>
              {specificity.valueOf() === 0 ? "AVAILABLE TO RENT" : "RENTING"}{" "}
              &nbsp; &nbsp;
            </span>
            <Box onClick={switchSpecificity}>
              <Toggle isOn={specificity === RentSpecificity.RENTING} />
            </Box>
          </Box>
        </Box>
        {specificity === RentSpecificity.RENTING && <AllMyRenting />}
        {specificity === RentSpecificity.ALL && <AvailableToRent />}
      </Box>
    </Box>
  );
};

export default Rent;
