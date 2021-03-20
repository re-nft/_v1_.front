import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from "react-router-dom";
import Layout from "./layout";
import Rent from "../pages/rent";
import Lend from "../pages/lend";
import Faq from "../pages/faq";
import Dashboard from "../pages/dashboard";
import MyFavorites from "../pages/favourites";
import Leaderboard from '../pages/leaderboard';
import { TransactionNotifier } from "../transaction-notifier";

const OFFSET_TOP = 180;
const App: React.FC = () => {
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
      <Router>
        <div className={`content-wrapper mb-l ${scrollY > OFFSET_TOP ? 'fixed-position' : ''}`}>
          <div className="menu">
            <NavLink
              className="menu__item"
              activeClassName="menu__item-active"
              to="/"
              isActive={(_, location) => {
                if (location.pathname === "/") return true;
                return false;
              }}
            >
                Rent NFT
            </NavLink>
            <NavLink
              className="menu__item"
              activeClassName="menu__item-active"
              to="/lend"
              isActive={(_, location) => {
                if (location.pathname === "/lend") return true;
                return false;
              }}
            >
                Lend NFT
            </NavLink>
            <NavLink
              className="menu__item"
              activeClassName="menu__item-active"
              to="/dashboard"
              isActive={(_, location) => {
                if (location.pathname === "/dashboard") return true;
                return false;
              }}
            >
                My Dashboard
            </NavLink>
            <NavLink
              className="menu__item"
              activeClassName="menu__item-active"
              to="/favourites"
              isActive={(_, location) => {
                if (location.pathname === "/favourites") return true;
                return false;
              }}
            >
                My Favourites
            </NavLink>
            <NavLink
              className="menu__item"
              activeClassName="menu__item-active"
              to="/leaderboard"
              isActive={(_, location) => {
                if (location.pathname === "/leaderboard") return true;
                return false;
              }}
            >
                Leaderboard
            </NavLink>
            <NavLink
              className="menu__item"
              activeClassName="menu__item-active"
              to="/faq"
              isActive={(_, location) => {
                if (location.pathname === "/faq") return true;
                return false;
              }}
            >
                FAQ
            </NavLink>
          </div>
        </div>
        {/* CONTENT */}
        <div className="content-wrapper main-content mb-l">
          <Switch>
            <Route exact path="/">
              <Rent />
            </Route>
            <Route exact path="/lend">
              <Lend/>
            </Route>
            <Route exact path="/dashboard">
              <Dashboard />
            </Route>
            <Route exact path="/favourites">
              <MyFavorites/>
            </Route>
            <Route exact path="/leaderboard">
              <Leaderboard/>
            </Route>
            <Route exact path="/faq">
              <Faq />
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
