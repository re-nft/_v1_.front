import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { classNames } from "renft-front/utils";
import { DevMenu } from "./app-layout/dev-menu";
import { SnackAlert } from "renft-front/components/common/snack-alert";
import { SearchMenu } from "./search-menu";

type PageLayoutProps = {
  tabs: { name: string; href: string; current: boolean }[];
  hideDevMenu?: true;
  hideSearchMenu?: true;
  addPadding?: true;
};

const SearchLayout: React.FC<PageLayoutProps> = ({
  tabs,
  children,
  hideDevMenu = false,
  hideSearchMenu = false,
  addPadding = false,
}) => {
  const router = useRouter();
  if (!tabs || tabs.length < 1)
    return (
      <div className="flex flex-col py-4 w-full">
        <div className="flex flex-col md:flex-row pr-10">
          {!hideDevMenu && <DevMenu />}
          {!hideSearchMenu && <SearchMenu />}
        </div>
        {children}
        <SnackAlert />
      </div>
    );

  return (
    <div className="flex flex-col py-4 w-full">
      {!hideDevMenu && <DevMenu />}

      {!hideSearchMenu && !addPadding && <SearchMenu />}
      {!hideSearchMenu && addPadding && (
        <div className="pr-10">
          <SearchMenu />
        </div>
      )}
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
        <SnackAlert />
      </div>
    </div>
  );
};

export default SearchLayout;
