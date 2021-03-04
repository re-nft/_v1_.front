import React, { useState, useCallback } from "react";
import { Box } from "@material-ui/core";

import Layout from "./components/layout/layout";
import Rent from "./components/pages/rent";
import Lend from "./components/pages/lend";
import Faq from "./components/pages/faq";
import Dashboard from "./components/pages/dashboard";
import { TransactionNotifier } from "./components/transaction-notifier";

enum Tabs {
  RENT,
  LEND,
  STATS,
  LEADER,
  GETNFT,
  HOW,
  DAI,
}

type TabProps = {
  setTab: (tab: Tabs) => void;
  isFocused: boolean;
  thisTab: Tabs;
  buttonName: string;
};

const Tab: React.FC<TabProps> = ({
  setTab,
  thisTab,
  isFocused,
  buttonName,
}) => {
  const handleClick = useCallback(() => {
    setTab(thisTab);
  }, [setTab, thisTab]);

  return (
    <div role="button" style={{ marginRight: "16px" }} onClick={handleClick}>
      <span className={isFocused ? "active-tab" : "Navigation__button"}>
        {buttonName}
      </span>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState(Tabs.RENT);

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
          setTab={setActiveTab}
          isFocused={activeTab === Tabs.RENT}
          thisTab={Tabs.RENT}
          buttonName="Rent NFT"
        />
        <Tab
          setTab={setActiveTab}
          isFocused={activeTab === Tabs.LEND}
          thisTab={Tabs.LEND}
          buttonName="Lend NFT"
        />
        <Tab
          setTab={setActiveTab}
          isFocused={activeTab === Tabs.STATS}
          thisTab={Tabs.STATS}
          buttonName="My Dashboard"
        />
        <Tab
          setTab={setActiveTab}
          isFocused={activeTab === Tabs.HOW}
          thisTab={Tabs.HOW}
          buttonName="FAQ"
        />
      </Box>
      <TransactionNotifier />
      <Box
        style={{
          padding: "32px 64px",
          border: "3px solid black",
          overflowY: "scroll",
          height: "80vh",
        }}
      >
        <Rent hidden={activeTab !== Tabs.RENT} />
        <Lend hidden={activeTab !== Tabs.LEND} />
        <Faq hidden={activeTab !== Tabs.HOW} />
        <Dashboard hidden={activeTab !== Tabs.STATS} />
      </Box>
    </Layout>
  );
};

export default App;
