import React, { useState, useCallback } from "react";
import { Box } from "@material-ui/core";

// components and other
import Layout from "../layouts/index";
import ShadowScrollbars from "./ShadowScrollbars";
import Psychedelic from "./Psychedelic";
import ComingSoon from "./ComingSoon";
import ButHow from "./ButHow";
import Stats from "./Stats";
import MintNft from "./MintNFT";
import Cold from "./Cold";

export default () => {
  const [activeTab, setActiveTab] = useState("RENT");
  const [nftModalOpen, setNftModalOpen] = useState(false);
  const handleNftModalOpen = useCallback(() => {
    setNftModalOpen(true);
  }, [setNftModalOpen]);
  const handleNftModalClose = useCallback(() => {
    setNftModalOpen(false);
  }, [setNftModalOpen]);
  const setTab = useCallback(
    tab => {
      return () => setActiveTab(tab);
    },
    [setActiveTab]
  );

  // TODO: rewrite with a router
  return (
    <Layout>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          padding: "0 0 32px 0"
        }}
      >
        <div
          role="button"
          style={{ marginRight: "16px" }}
          onClick={setTab("RENT")}
          onKeyDown={setTab("RENT")}
        >
          <span
            className={activeTab === "RENT" ? "active-tab" : "Product__button"}
          >
            Rent NFT
          </span>
        </div>
        <div
          role="button"
          style={{ marginRight: "16px" }}
          onClick={setTab("LEND")}
          onKeyDown={setTab("LEND")}
        >
          <span
            className={activeTab === "LEND" ? "active-tab" : "Product__button"}
          >
            Lend NFT
          </span>
        </div>
        <div
          role="button"
          style={{ marginRight: "16px" }}
          onClick={setTab("STATS")}
          onKeyDown={setTab("STATS")}
        >
          <span
            className={activeTab === "STATS" ? "active-tab" : "Product__button"}
          >
            My Stats
          </span>
        </div>
        <div
          role="button"
          style={{ marginRight: "16px" }}
          onClick={setTab("LEADER")}
          onKeyDown={setTab("LEADER")}
        >
          <span
            className={
              activeTab === "LEADER" ? "active-tab" : "Product__button"
            }
          >
            Leaderboard
          </span>
        </div>
        <div
          role="button"
          style={{ marginRight: "16px" }}
          onClick={handleNftModalOpen}
        >
          <span
            className={
              activeTab === "GETNFT" ? "active-tab" : "Product__button"
            }
          >
            Get NFT
          </span>
        </div>
        <MintNft open={nftModalOpen} handleClose={handleNftModalClose} />
        <div role="button" onClick={setTab("HOW")} onKeyDown={setTab("HOW")}>
          <span
            className={activeTab === "HOW" ? "active-tab" : "Product__button"}
          >
            But How?!
          </span>
        </div>
      </div>
      <ShadowScrollbars style={{ height: "800px" }}>
        <Box
          style={{
            padding: "32px 64px",
            border: "3px solid black"
          }}
        >
          <Psychedelic hidden={activeTab !== "RENT"} isRent={true}>
            <Cold fancyText="One day it will be warm here..." />
          </Psychedelic>
          <Psychedelic hidden={activeTab !== "LEND"} isRent={false}>
            <Cold fancyText="One day it will be warm here..." />
          </Psychedelic>
          <ComingSoon hidden={activeTab !== "LEADER"} />
          <ButHow hidden={activeTab !== "HOW"} />
          <Stats hidden={activeTab !== "STATS"} />
        </Box>
      </ShadowScrollbars>
    </Layout>
  );
};
