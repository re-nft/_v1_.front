import React, { useContext, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  NavLink,
} from "react-router-dom";
import Layout from "./layout";
import Rent from "../pages/rent";
import Lend from "../pages/lend";
import Faq from "../pages/faq";
import Dashboard from "../pages/dashboard";
import MyFavorites from "../pages/favourites";
import Profile from "../pages/profile";
import PageLayout from "../components/page-layout";
import { TransactionNotifier } from "./transaction-notifier";
import GraphContext from "../contexts/graph";
import { short, advanceTime } from "../utils";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";

import createDebugger from "debug";
// import { ContractContext } from "../contexts/ContractsProvider";
import UserContext from "../contexts/UserProvider";
import { Button } from "./button";

const debug = createDebugger("app:layout");
const ROUTES = [
  {
    path: "/",
    name: "Rent",
  },
  {
    path: "/lend",
    name: "Lend",
  },
  {
    path: "/dashboard",
    name: "My Dashboard",
  },
  // {
  //   path: "/favourites",
  //   name: "My Favourites",
  // },
  // {
  //   path: "/leaderboard",
  //   name: "Leaderboard",
  // },
  {
    path: "/faq",
    name: "FAQ",
  },
];
const InstallMetamask = () => {
  return (
    <div id="installMetaMask" className="cjAFRf web3modal-provider-wrapper">
      <a
        href="https://metamask.io/"
        target="_blank"
        className="cjAFRf web3modal-provider-container"
        rel="noreferrer"
      >
        <div className="jMhaxE web3modal-provider-icon">
          <img src="/metamask.svg" alt="MetaMask" width="32px" height="32px" />
        </div>
        <div className="bktcUM sc-web3modal-provider-name mt-0">
          Install MetaMask
        </div>
      </a>
    </div>
  );
};
const App: React.FC = () => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const { network, connect } = useContext(UserContext);
  const { userData } = useContext(GraphContext);
  // const { E721, E721B, E1155, E1155B, WETH, DAI, USDC, USDT, TUSD } =
  //   useContext(ContractContext);
  const [username, setUsername] = useState<string>();

  const installMetaMask = !(window.web3 || window.ethereum);

  useEffect(() => {
    if (userData?.name !== "") {
      setUsername(userData?.name);
    }
  }, [userData]);

  // const mintE20 = useCallback(
  //   async (e20: number) => {
  //     switch (e20) {
  //       case 1:
  //         if (!WETH) return;
  //         await (await WETH.faucet()).wait();
  //         break;
  //       case 2:
  //         if (!DAI) return;
  //         await (await DAI.faucet()).wait();
  //         break;
  //       case 3:
  //         if (!USDC) return;
  //         await (await USDC.faucet()).wait();
  //         break;
  //       case 4:
  //         if (!USDT) return;
  //         await (await USDT.faucet()).wait();
  //         break;
  //       case 5:
  //         if (!TUSD) return;
  //         await (await TUSD.faucet()).wait();
  //         break;
  //     }
  //   },
  //   [DAI, TUSD, USDC, USDT, WETH]
  // );
  // const mintNFT = useCallback(
  //   async (nft: number) => {
  //     switch (nft) {
  //       case 0:
  //         if (!E721) return;
  //         await (await E721.faucet()).wait();
  //         break;
  //       case 1:
  //         if (!E721B) return;
  //         await (await E721B.faucet()).wait();
  //         break;
  //       case 2:
  //         if (!E1155) return;
  //         await (await E1155.faucet(10)).wait();
  //         break;
  //       case 3:
  //         if (!E1155B) return;
  //         await (await E1155B.faucet(10)).wait();
  //         break;
  //       default:
  //         debug("unknown NFT");
  //         return;
  //     }
  //   },
  //   [E721, E721B, E1155, E1155B]
  // );

  const networkName =
    network !== process.env.REACT_APP_NO_WALLET_PROVIDER
      ? `Wrong network! Please switch to ${network}`
      : network;
  return (
    <Layout>
      <Router>
        <div className="content-wrapper mb-l">
          <div className="header">
            <div className="header__logo"></div>
            {!installMetaMask && !currentAddress ? (
              <Button
                handleClick={connect}
                description="Please connect your wallet!"
              />
            ) : (
              <div className="header__user">
                {installMetaMask && <InstallMetamask />}

                {!installMetaMask && !!currentAddress && (
                  <>
                    {networkName} &nbsp;
                    <Link className="" to="/profile">
                      {username || short(currentAddress)}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="content-wrapper mb-l">
          <div className="menu">
            {ROUTES.map((route) => (
              <NavLink
                key={route.path}
                className="menu__item"
                activeClassName="menu__item-active"
                to={route.path}
                isActive={(_, location) => {
                  if (location.pathname === route.path) return true;
                  return false;
                }}
              >
                {route.name}
              </NavLink>
            ))}
          </div>
          {/* <button className="menu__item" onClick={() => mintNFT(0)}>
            Mint 721A
          </button>
          <button className="menu__item" onClick={() => mintNFT(1)}>
            Mint 721B
          </button>
          <button className="menu__item" onClick={() => mintNFT(2)}>
            Mint 1155A
          </button>
          <button className="menu__item" onClick={() => mintNFT(3)}>
            Mint 1155B
          </button> */}
          {/* payment token faucets */}
          <div>
            {/* <button className="menu__item" onClick={() => mintE20(1)}>
              Mint WETH
            </button>
            <button className="menu__item" onClick={() => mintE20(2)}>
              Mint DAI
            </button>
            <button className="menu__item" onClick={() => mintE20(3)}>
              Mint USDC
            </button>
            <button className="menu__item" onClick={() => mintE20(4)}>
              Mint USDT
            </button>
            <button className="menu__item" onClick={() => mintE20(5)}>
              Mint TUSD
            </button> */}
            <button
              className="menu__item"
              onClick={() => advanceTime(24 * 60 * 60)}
            >
              Advance time
            </button>
          </div>
        </div>
        {/* CONTENT */}
        <div className="content-wrapper main-content mb-l">
          <Switch>
            <Route exact path="/">
              <Rent />
            </Route>
            <Route exact path="/lend">
              <Lend />
            </Route>
            <Route exact path="/dashboard">
              <PageLayout>
                <Dashboard />
              </PageLayout>
            </Route>
            <Route exact path="/favourites">
              <MyFavorites />
            </Route>
            {/* <Route exact path="/leaderboard">
              <Leaderboard />
            </Route> */}
            <Route exact path="/faq">
              <Faq />
            </Route>
            <Route exact path="/profile">
              <Profile />
            </Route>
          </Switch>
        </div>
      </Router>
      {/* FOOTER */}
      <div className="content-wrapper footer-content">
        <div className="copy">2021 ReNFT</div>
        <div className="copy">
          App version: {process.env.REACT_APP_VERCEL_GIT_COMMIT_SHA}
        </div>
        <div className="soc">
          <a
            href="https://discord.gg/ka2u9n5sWs"
            target="_blank"
            rel="noreferrer"
          >
            <span className="discord"></span>
          </a>
          <a
            href="https://twitter.com/renftlabs"
            target="_blank"
            rel="noreferrer"
          >
            <span className="twitter"></span>
          </a>
        </div>
      </div>
      <TransactionNotifier />
    </Layout>
  );
};

export default App;
