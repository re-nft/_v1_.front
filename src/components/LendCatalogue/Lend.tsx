import React, { useState, useCallback } from "react";
import { Box } from "@material-ui/core";

import Toggle from "../Toggle";
import { AvailableToLend } from "./AvailableToLend";
import { AllMyLending } from "./AllMyLending";

type LendProps = {
  hidden: boolean;
};

enum LendSpecificity {
  ALL,
  LENDING,
}

export const Lend: React.FC<LendProps> = ({ hidden }) => {
  const [specificity, setSpecificiy] = useState<LendSpecificity>(
    LendSpecificity.ALL
  );

  const switchSpecificity = useCallback(() => {
    setSpecificiy((specificity) =>
      specificity === LendSpecificity.ALL
        ? LendSpecificity.LENDING
        : LendSpecificity.ALL
    );
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
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginLeft: "auto",
            }}
          >
            <span style={{ textTransform: "uppercase", fontWeight: "bold" }}>
              {specificity.valueOf() === 0 ? "AVAILABLE TO LEND" : "LENDING"}{" "}
              &nbsp; &nbsp;
            </span>
            <Box onClick={switchSpecificity}>
              <Toggle isOn={specificity === LendSpecificity.LENDING} />
            </Box>
          </Box>
        </Box>
        {specificity === LendSpecificity.LENDING && <AllMyLending />}
        {specificity === LendSpecificity.ALL && <AvailableToLend />}
      </Box>
    </Box>
  );
};

export default Lend;
