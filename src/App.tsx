import React, { useState, useCallback } from "react";
import { Box } from "@material-ui/core";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";

// components and other
import Layout from "./layouts/index";
import Rent from "./components/Rent";
import Lend from "./components/Lend";
import ButHow from "./components/ButHow";
import Stats from "./components/Stats";
import Leaderboard from "./components/Leaderboard";
import { GraphProvider } from "./contexts/Graph";
import { Symfoni } from "./hardhat/SymfoniContext";

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
      <span className={isFocused ? "active-tab" : "Product__button"}>
        {buttonName}
      </span>
    </div>
  );
};

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      "Righteous",
      "consolas",
      "Menlo",
      "monospace",
      "sans-serif",
    ].join(","),
  },
});

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState(Tabs.RENT);

  // TODO: rewrite with a router
  return (
    <Symfoni>
      <GraphProvider>
        <ThemeProvider theme={theme}>
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
                isFocused={activeTab === Tabs.LEADER}
                thisTab={Tabs.LEADER}
                buttonName="Leaderboard?"
              />
              <Tab
                setTab={setActiveTab}
                isFocused={activeTab === Tabs.HOW}
                thisTab={Tabs.HOW}
                buttonName="FAQ"
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
              <Rent hidden={activeTab !== Tabs.RENT} />
              <Lend hidden={activeTab !== Tabs.LEND} />
              <Leaderboard hidden={activeTab !== Tabs.LEADER} />
              <ButHow hidden={activeTab !== Tabs.HOW} />
              <Stats hidden={activeTab !== Tabs.STATS} />
            </Box>
          </Layout>
        </ThemeProvider>
      </GraphProvider>
    </Symfoni>
  );
};

export default App;
