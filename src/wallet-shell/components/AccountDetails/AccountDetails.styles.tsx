import { XIcon as Close } from "@heroicons/react/outline";

import { ExternalLink } from "../common/ExternalLink";
import React, { HTMLProps } from "react";

export const HeaderRow: React.FC = ({ children }) => {
  return (
    <div className="flex flex-row p-4 font-medium color-pink-500">
      {children}
    </div>
  );
};

export const UpperSection: React.FC = ({ children }) => {
  return <div className="relative">{children}</div>;
};

export const InfoCard: React.FC = ({ children }) => {
  return (
    <div className="relative grid p-5 mb-5 border border-gray-200 boder-solid gap-x-3">
      {children}
    </div>
  );
};

export const AccountGroupingRow: React.FC<{ id?: string }> = ({
  children,
  id,
}) => {
  return (
    <div
      className="flex flex-row items-center justify-between font-normal text-black"
      id={id}
    >
      {children}
    </div>
  );
};

export const AccountSection: React.FC<{
  id?: string;
}> = ({ children, id }) => {
  return (
    <div className="pt-4 pb-4 pl-6 md:p-4" id={id}>
      {children}
    </div>
  );
};

export const LowerSection: React.FC<{ id?: string }> = ({ children, id }) => {
  return (
    <div
      className="flex flex-col flex-grow p-6 overflow-auto bg-gray-200"
      id={id}
    >
      {children}
    </div>
  );
};

export const AccountControl: React.FC<{ id?: string }> = ({ children, id }) => {
  return (
    <div
      className="flex flex-row items-center w-full pb-2 text-lg font-medium"
      id={id}
    >
      {children}
    </div>
  );
};

export const AddressLink: React.FC<
  Omit<HTMLProps<HTMLAnchorElement>, "as" | "ref" | "onClick"> & {
    href: string;
  }
> = ({ ...rest }) => {
  return (
    <ExternalLink
      className="flex flex-row items-center flex-shrink-0 ml-4 text-sm font-medium text-gray-400 no-underline cursor-pointer justify-content hover:text-gray-600 focus:text-gray-600 active:text-gray-600"
      {...rest}
    />
  );
};
// TODO duplication
export const CloseIcon: React.FC<{
  onClick: () => void;
}> = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute right-4 top-4 hover:cursor-pointer hover:opacity-60"
    >
      {children}
    </button>
  );
};

// TODO duplicaion
export const CloseColor: React.FC = () => {
  return (
    <span className="h-4 w-4 flex">
      <Close />
    </span>
  );
};

export const WalletName: React.FC = ({ children }) => {
  return <div className="text-sm font-medium text-gray-500">{children}</div>;
};

export const TransactionListWrapper: React.FC = ({ children }) => {
  return <button className="flex flex-col">{children}</button>;
};
export const WalletAction: React.FC<{
  onClick: () => void;
}> = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 px-1 py-2 ml-2 text-sm font-normal text-pink-500 border border-pink-300 border-solid rounded-md hover:cursor-pointer focus:shadow-md focus:border-pink-500 hover:border-pink-500 active:shadow-md active:border-pink-500 "
      style={{ width: "fit-content" }}
    >
      {children}
    </button>
  );
};

export const AutoRow: React.FC = ({ children }) => {
  return (
    <button className="flex flex-row justify-between mb-3">{children}</button>
  );
};
