import React, { useState, useCallback } from "react";
import { Box } from "@material-ui/core";

// components and other
import Layout from "../layouts/index";
import Psychedelic from "./Psychedelic";
import ComingSoon from "./ComingSoon";
import ButHow from "./ButHow";
import Stats from "./Stats";
import MintNft from "./MintNFT";

// make enum
type PossibleTabs = "RENT" | "LEND" | "STATS" | "LEADER" | "GETNFT" | "HOW";

type TabProps = {
  setTab: (tab: string) => void;
  activeTab: PossibleTabs;
  tabName: string;
  buttonName: string;
};

const Tab: React.FC<TabProps> = ({
  setTab,
  activeTab,
  tabName,
  buttonName,
}) => {
  return (
    <div
      role="button"
      style={{ marginRight: "16px" }}
      onClick={setTab(tabName)}
      onKeyDown={setTab(tabName)}
    >
      <span
        className={activeTab === tabName ? "active-tab" : "Product__button"}
      >
        {buttonName}
      </span>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState("RENT");
  const [nftModalOpen, setNftModalOpen] = useState(false);

  const handleNftModal = useCallback(() => {
    setNftModalOpen(!nftModalOpen);
  }, [nftModalOpen]);

  const setTab = useCallback(
    (tab) => {
      return () => setActiveTab(tab);
    },
    [setActiveTab]
  );

  // TODO: rewrite with a router
  return (
    <Layout>
      <Box
        style={{
          display: "flex",
          flexDirection: "row",
          padding: "0 0 32px 0",
        }}
      >
        <Tab
          setTab={setTab}
          activeTab={activeTab}
          tabName="RENT"
          buttonName="Rent NFT"
        />
        <Tab
          setTab={setTab}
          activeTab={activeTab}
          tabName="LEND"
          buttonName="Lend NFT"
        />
        <Tab
          setTab={setTab}
          activeTab={activeTab}
          tabName="STATS"
          buttonName="My Stats"
        />
        <Tab
          setTab={setTab}
          activeTab={activeTab}
          tabName="LEADER"
          buttonName="Leaderboard"
        />
        <div
          role="button"
          style={{ marginRight: "16px" }}
          onClick={handleNftModal}
        >
          <span
            className={
              activeTab === "GETNFT" ? "active-tab" : "Product__button"
            }
          >
            Get NFT
          </span>
        </div>
        <MintNft open={nftModalOpen} handleClose={handleNftModal} />
        <Tab
          setTab={setTab}
          activeTab={activeTab}
          tabName="HOW"
          buttonName="But How?!"
        />
      </Box>
      <Box
        style={{
          padding: "32px 64px",
          border: "3px solid black",
          overflowY: "scroll",
          height: "80vh",
        }}
      >
        {/* TODO: tidy up this craziness */}
        <Psychedelic hidden={activeTab !== "RENT"} isRent={true} />
        <Psychedelic hidden={activeTab !== "LEND"} isRent={false} />
        <ComingSoon hidden={activeTab !== "LEADER"} />
        <ButHow hidden={activeTab !== "HOW"} />
        <Stats hidden={activeTab !== "STATS"} />
      </Box>
    </Layout>
  );
};

export default App;
