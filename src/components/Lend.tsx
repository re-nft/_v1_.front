import React, {
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { Box } from "@material-ui/core";

import ContractsContext from "../contexts/Contracts";

import ScrollForMore from "./ScrollForMore";
import Cold from "./Cold";
import LendCatalogue from "./LendCatalogue";
import Switcher from "./Switcher";
import { Nft } from "../types";

type LendProps = {
  hidden: boolean;
};

enum LendSpecificity {
  ALL,
  LENDING,
}

const Lend: React.FC<LendProps> = ({ hidden }) => {
  const { helpers } = useContext(ContractsContext);
  const { openSeaNfts, nonOpenSeaNfts } = helpers;
  const [myNfts, setMyNfts] = useState<Nft[]>([]);
  const [myLendingNfts, setMyLendingNfts] = useState<Nft[]>([]);
  const [specificity, setSpecificiy] = useState<LendSpecificity>(
    LendSpecificity.ALL
  );

  const handleSpecificity = useCallback(() => {
    setSpecificiy((specificity) =>
      specificity === LendSpecificity.ALL
        ? LendSpecificity.LENDING
        : LendSpecificity.ALL
    );
  }, []);

  useEffect(() => {
    const _myNfts = openSeaNfts.concat(nonOpenSeaNfts);
    setMyNfts(_myNfts);
  }, [openSeaNfts, nonOpenSeaNfts]);

  const nfts = useMemo(() => {
    return specificity === LendSpecificity.ALL ? myNfts : myLendingNfts;
  }, [specificity, myNfts, myLendingNfts]);

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
              {specificity.valueOf() === 0 ? "AVAILABLE TO LEND" : "LENDING"}{" "}
              &nbsp; &nbsp;
            </span>
            <Box onClick={handleSpecificity}>
              <Switcher />
            </Box>
          </Box>
        </Box>
        <LendCatalogue
          nfts={nfts}
          iLend={specificity === LendSpecificity.LENDING}
        />
      </Box>
      {nfts.length < 1 && <Cold fancyText="One day it will be warm here..." />}
    </Box>
  );
};

export default Lend;
