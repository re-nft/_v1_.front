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
import Leaderboard from "../pages/leaderboard";
import Profile from "../pages/profile";
import PageLayout from "../components/page-layout";
import { TransactionNotifier } from "./transaction-notifier";
import { CurrentAddressContext } from "../hardhat/SymfoniContext";
import GraphContext from "../contexts/graph";
import { short } from "../utils";

const ROUTES = [
  {
    path: "/",
    name: "Rent NFT",
  },
  {
    path: "/lend",
    name: "Lend NFT",
  },
  {
    path: "/dashboard",
    name: "My Dashboard",
  },
  {
    path: "/favourites",
    name: "My Favourites",
  },
  {
    path: "/leaderboard",
    name: "Leaderboard",
  },
  {
    path: "/faq",
    name: "FAQ",
  },
];

const App: React.FC = () => {
  const [currentAddress] = useContext(CurrentAddressContext);
  const { userData } = useContext(GraphContext);
  const [username, setUsername] = useState<string>();

  useEffect(() => {
    if (userData?.name !== "") {
      setUsername(userData?.name);
    }
  }, [userData]);

  return (
    <Layout>
      <Router>
        <div className="content-wrapper mb-l">
          <div className="header">
            <div className="header__logo"></div>
            <div className="header__user">
              <Link className="" to="/profile">
                {username || short(currentAddress)}
              </Link>
            </div>
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
            <Route exact path="/leaderboard">
              <Leaderboard />
            </Route>
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
