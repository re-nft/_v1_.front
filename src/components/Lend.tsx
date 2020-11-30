import React, {
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { Box } from "@material-ui/core";

// contexts
import DappContext from "../contexts/Dapp";
import ContractsContext from "../contexts/Contracts";

import ScrollForMore from "./ScrollForMore";
import Cold from "./Cold";
import LendCatalogue from "./LendCatalogue";
import Switcher from "./Switcher";
import { Lending } from "types";

type LendProps = {
  hidden: boolean;
};

enum LendSpecificity {
  ALL,
  LENDING,
}

const Lend: React.FC<LendProps> = ({ hidden }) => {
  const { wallet } = useContext(DappContext);
  const { helpers } = useContext(ContractsContext);
  const {
    fetchOpenSeaNfts,
    externalNftAddresses,
    fetchExternalNfts,
    nfts,
  } = helpers;
  const [currentlyLending, setCurrentlyLending] = useState<Lending[]>([]);
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
    if (!wallet?.account) {
      console.debug("no user or wallet");
      return;
    }

    // todo: find a better way to avoid constant re-fetching
    if (externalNftAddresses.length > 0) fetchExternalNfts();
  }, [
    wallet?.account,
    wallet?.networkName,
    fetchExternalNfts,
    externalNftAddresses,
  ]);

  const data = useMemo(() => {
    return specificity === LendSpecificity.ALL ? nfts : currentlyLending;
  }, [specificity, nfts, currentlyLending]);

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
              {specificity.valueOf() === 0 ? "AVAILABLE TO LEND" : "LENDING"}{" "}
              &nbsp; &nbsp;
            </span>
            <Box onClick={handleSpecificity}>
              <Switcher />
            </Box>
          </Box>
        </Box>
        <LendCatalogue
          data={data}
          iLend={specificity === LendSpecificity.LENDING}
        />
      </Box>
      {data.length < 1 && <Cold fancyText="One day it will be warm here..." />}
    </Box>
  );
};

export default Lend;
