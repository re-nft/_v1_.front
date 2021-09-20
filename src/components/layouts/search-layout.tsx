import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { classNames } from "../../utils";
import { DevMenu } from "./app-layout/dev-menu";
import { SnackAlert } from "../common/snack-alert";

type PageLayoutProps = {
  tabs: { name: string; href: string; current: boolean }[];
  hideDevMenu?: true;
};

const SearchLayout: React.FC<PageLayoutProps> = ({
  tabs,
  children,
  hideDevMenu = false
}) => {
  const router = useRouter();
  if (!tabs || tabs.length < 1)
    return (
      <div className="flex flex-col py-4 w-full">
        {!hideDevMenu && <DevMenu />}

        {children}
      </div>
    );

  return (
    <div className="flex flex-col py-4 w-full">
      {!hideDevMenu && <DevMenu />}
      <div>
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full pl-3 pr-10 py-2 text-base justify-end focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm "
            defaultValue={tabs.find((tab) => tab.current)?.name}
            onChange={(event) => {
              router.push(event?.target.value);
            }}
          >
            {tabs.map((tab) => (
              <option key={tab.name} value={tab.href}>
                {tab.name}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="flex justify-start ml-6 py-4">
            <nav
              className="-mb-px flex justify-end space-x-2 leading-rn-1"
              aria-label="Tabs"
            >
              {tabs.map((tab) => (
                <Link href={tab.href} key={tab.name}>
                  <a
                    className={classNames(
                      tab.current
                        ? "text-rn-orange"
                        : "text-white hover:text-rn-orange",
                      "whitespace-nowrap flex px-1 text-lg px-2 font-display"
                    )}
                    aria-current={tab.current ? "page" : undefined}
                  >
                    {tab.name}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      {children}
      <div className="flex-1">
        <SnackAlert></SnackAlert>
      </div>
    </div>
  );
};

export default SearchLayout;
