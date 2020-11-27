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
import GraphContext from "../contexts/Graph";

import ScrollForMore from "./ScrollForMore";
import Cold from "./Cold";
import LendCatalogue from "./LendCatalogue";
import Switcher from "./Switcher";
import { Lending, Nft } from "types";

// with id separator (2 characters)
const LenOfAddress = 44;

type LendProps = {
  hidden: boolean;
};

enum LendSpecificity {
  ALL,
  LENDING,
}

const Lend: React.FC<LendProps> = ({ hidden }) => {
  const { wallet } = useContext(DappContext);
  const { user } = useContext(GraphContext);
  const [currentlyLending, setCurrentlyLending] = useState<Lending[]>([]);
  const [allMyNfts, setAllMyNfts] = useState<Nft[]>([]);
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
    if (!user || !wallet?.account) {
      console.debug("no user or wallet");
      return;
    }

    // const curr: Face[] = [];
    // const currIds: string[] = [];
    // for (let i = 0; i < user.lending.length; i++) {
    //   const _id = user.lending[i].id;
    //   const resolvedId = _id.slice(0, _id.length - LenOfAddress);
    //   const face = { id: resolvedId, uri: user.lending[i].face.uri };
    //   curr.push(face);
    //   currIds.push(resolvedId);
    // }

    // const all = user.faces.filter((face) => !currIds.includes(face.id));
    // setAllNfts(all);
    // setCurrentlyLending(curr);
  }, [user, wallet]);
  const data = useMemo(() => {
    return specificity === LendSpecificity.ALL ? allMyNfts : currentlyLending;
  }, [specificity, allMyNfts, currentlyLending]);

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
