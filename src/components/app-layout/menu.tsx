import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

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
const isPathActive = (linkPath: string, pathname: string) => {
  if (pathname === linkPath) return true;
  if (pathname.includes(linkPath) && linkPath !== "/") return true;
  if (pathname.includes("/rent") && linkPath === "/") return true;
  if (pathname === "/user-is-renting" && linkPath === "/") return true;
  if (pathname === "/user-is-lending" && linkPath === "/lend") return true;
  return false;
};
export const Menu: React.FC = () => {
  const { pathname } = useRouter();
  return (
    <div className="flex ">
      {ROUTES.map((route) => {
        const isActive = isPathActive(route.path, pathname);
        return (
          <Link key={route.path} href={route.path}>
            <div className="flex-1 mr-2">
              <a
                className={`menu__item ${isActive ? "menu__item--active" : ""}`}
              >
                <div>{route.name}</div>
              </a>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
