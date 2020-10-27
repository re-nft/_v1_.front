import React, { useState, useCallback } from "react";
import { StaticQuery, graphql } from "gatsby";
import { Box } from "@material-ui/core";
import { useWallet } from "use-wallet";

import ShadowScrollbars from "./ShadowScrollbars";
import Layout from "../layouts/index";
import Psychedelic from "./Psychedelic";
import ComingSoon from "./ComingSoon";
import ButHow from "./ButHow";
import DappContext from "../contexts/Dapp";
import Stats from "./Stats";
import { getGanFace } from "../api/ganFace";
import MintNft from "./MintNFT";
import Cold from "./Cold";

export default () => {
  const [activeTab, setActiveTab] = useState("RENT");
  const [nftModalOpen, setNftModalOpen] = useState(false);
  const handleNftModalOpen = useCallback((e) => {
    setNftModalOpen(true);
  }, [setNftModalOpen]);
  const handleNftModalClose = useCallback((e) => {
    setNftModalOpen(false);
  }, [setNftModalOpen]);
  const wallet = useWallet();
  const [web3, setWeb3] = useState();
  const setTab = useCallback(
    (tab) => {
      return () => setActiveTab(tab);
    },
    [setActiveTab]
  );

  return (
    <DappContext.Provider value={{wallet, web3, setWeb3}}>
      {/* <StaticQuery
        query={graphql`
          query CatalogueQuery {
            allCustomApi {
              edges {
                node {
                  assets {
                    asset_contract {
                      address
                      asset_contract_type
                      created_date(fromNow: true)
                      description
                    }
                    token_id
                    image_original_url
                  }
                }
              }
            }
            site {
              siteMetadata {
                siteName
              }
            }
          }
        `}
        render={(data) => ( */}
            <Layout site="Rent NFT" wallet={wallet} web3={web3} setWeb3={setWeb3}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  padding: "0 0 32px 0",
                }}
              >
                {/* <div role="button" onClick={getFace} style={{backgroundColor: "green", cursor: "pointer"}}>
                  Click me
                </div>
                <div className="Product__image"><img id="face"></img></div> */}
                <div
                  role="button"
                  style={{ marginRight: "16px" }}
                  onClick={setTab("RENT")}
                  onKeyDown={setTab("RENT")}
                >
                  <span
                    className={
                      activeTab === "RENT" ? "active-tab" : "Product__button"
                    }
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
                    className={
                      activeTab === "LEND" ? "active-tab" : "Product__button"
                    }
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
                    className={
                      activeTab === "STATS" ? "active-tab" : "Product__button"
                    }
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
                <div
                  role="button"
                  onClick={setTab("HOW")}
                  onKeyDown={setTab("HOW")}
                >
                  <span
                    className={
                      activeTab === "HOW" ? "active-tab" : "Product__button"
                    }
                  >
                    But How?!
                  </span>
                </div>
              </div>
              <ShadowScrollbars style={{height: "800px"}}>
                <Box
                  style={{
                    padding: "32px 64px",
                    border: "3px solid black",
                  }}
                >
                  <Psychedelic hidden={activeTab !== "RENT"} isRent={true}>
                    <Cold fancyText="One day it will be warm here..." />
                  </Psychedelic>
                  <Psychedelic
                    hidden={activeTab !== "LEND"}
                    isRent={false}
                  >
                    <Cold fancyText="One day it will be warm here..." />
                  </Psychedelic>
                  <ComingSoon hidden={activeTab !== "LEADER"} />
                  <ButHow hidden={activeTab !== "HOW"} />
                  <Stats hidden={activeTab !== "STATS"} />
                </Box>
              </ShadowScrollbars>
            </Layout>
        {/* )} */}
      />
    </DappContext.Provider>
  );
};
