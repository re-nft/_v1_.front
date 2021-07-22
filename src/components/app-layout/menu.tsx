import { NavLink } from "react-router-dom";
import React from "react";

const ROUTES = [
  {
    path: "/",
    name: "Rent"
  },
  {
    path: "/lend",
    name: "Lend"
  },
  {
    path: "/dashboard",
    name: "My Dashboard"
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
    name: "FAQ"
  }
];
export const Menu = () => {
  return (
    <div className="menu">
      {ROUTES.map((route) => (
        <NavLink
          key={route.path}
          className="menu__item"
          activeClassName="menu__item-active"
          to={route.path}
          isActive={(_, location) => {
            if (location.pathname === route.path) return true;
            if (location.pathname === "/user-is-renting" && route.path === "/")
              return true;
            if (
              location.pathname === "/user-is-lending" &&
              route.path === "/lend"
            )
              return true;
            return false;
          }}
        >
          {route.name}
        </NavLink>
      ))}
    </div>
  );
};
