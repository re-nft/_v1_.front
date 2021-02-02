import React, { useState, useCallback } from "react";
import { Box } from "@material-ui/core";

import LendCatalogue from "./LendCatalogue";
import Switcher from "./Switcher";

type LendProps = {
  hidden: boolean;
};

enum LendSpecificity {
  ALL,
  LENDING,
}

const Lend: React.FC<LendProps> = ({ hidden }) => {
  // todo: will be coming from the graph
  // const [myLendingNfts, setMyLendingNfts] = useState<Nft[]>([]);
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

  // @ts-ignore
  const nfts: Nft[] = [];

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
              <Switcher />
            </Box>
          </Box>
        </Box>
        <LendCatalogue
          nfts={nfts}
          iLend={specificity === LendSpecificity.LENDING}
        />
      </Box>
    </Box>
  );
};

export default Lend;
