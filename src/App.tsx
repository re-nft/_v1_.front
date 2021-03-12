import React, { useState, useCallback, useEffect } from "react";

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
    <button className={`menu__item ${isFocused ? 'menu__item-active' : ''}`} onClick={handleClick}>
      {buttonName}
    </button>
  );
};

const OFFSET_TOP = 180;
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState(Tabs.RENT);
  const [scrollY, setScrollY] = useState(0);

  const updateHeaderPosition = () => {
    setScrollY(window.pageYOffset);
  }

  useEffect(() => {
    function watchScroll() {
      window.addEventListener("scroll", updateHeaderPosition);
    }
    watchScroll();
    return () => {
      window.removeEventListener("scroll", updateHeaderPosition);
    };
  });
  
  return (
    <Layout>
      {/* MENU */}
      <div className={`content-wrapper mb-l ${scrollY > OFFSET_TOP ? 'fixed-position' : ''}`}>
        <div className="menu">
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
            buttonName="Leaderboard"
          />
          <Tab
            setTab={setActiveTab}
            isFocused={activeTab === Tabs.HOW}
            thisTab={Tabs.HOW}
            buttonName="FAQ"
          />
        </div>
      </div>
      {/* CONTENT */}
      <div className="content-wrapper main-content mb-l">
        <Rent hidden={activeTab !== Tabs.RENT} />
        <Lend hidden={activeTab !== Tabs.LEND} />
        <Faq hidden={activeTab !== Tabs.HOW} />
        <Dashboard hidden={activeTab !== Tabs.STATS} />
      </div>
      {/* FOOTER */}
      <div className="content-wrapper footer-content">2021 ReNFT</div>
      <TransactionNotifier />
    </Layout>
  );
};

export default App;
