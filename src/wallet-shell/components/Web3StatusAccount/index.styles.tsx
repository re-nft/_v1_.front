import { Activity } from "react-feather";
import React, { ReactNode } from "react";
import clsx from "clsx";

export const Web3StatusError = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) => {
  return (
    <div
      className="flex items-center w-full p-2 font-medium text-white bg-red-500 border border-red-500 border-solid cursor-pointer select-none focus:outline-none hover:bg-red-600 focus:bg-red-600"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const Web3StatusConnected = ({
  children,
  pending,
  onClick,
  id,
}: {
  children: ReactNode;
  onClick: () => void;
  pending: boolean;
  id: string;
}) => {
  return (
    <div
      className={clsx(
        "w-full flex items-center p-2 cursor-pointer select-none focus:outline-none",
        "bg-gray-100 text-black font-medium border border-solid border-gray-300 shadow",
        "hover:text-black  hover:border-pink-500",
        "focus:text-black  focus:border-pink-500",
        pending && "bg-pink-500 focus:border-pink-600 hover:border-pink-600"
      )}
      onClick={onClick}
      id={id}
    >
      {children}
    </div>
  );
};

export const Web3StatusConnect = ({
  children,
  faded,
  onClick,
  id,
}: {
  children: ReactNode;
  onClick: () => void;
  faded: boolean;
  id: string;
}) => {
  return (
    <div
      className={clsx(
        "w-full flex items-center p-2 cursor-pointer select-none focus:outline-none",
        "bg-pink-300 text-black font-medium",
        "hover:text-black hover:border hover:border-solid hover:border-pink-300",
        "focus:text-black focus:border focus:border-solid focus:border-pink-300",
        faded && "bg-pink-100 border border-solid border-pink-100 text-black"
      )}
      onClick={onClick}
      id={id}
    >
      {children}
    </div>
  );
};

export const Text = ({ children }: { children: ReactNode }) => {
  return (
    <p
      className="flex-1 ml-1 mr-2 overflow-hidden text-base font-medium overflow-ellipsis whitespace-nowrap"
      style={{ width: "fit-content" }}
    >
      {children}
    </p>
  );
};

export const NetworkIcon = () => {
  return <Activity className="w-4 h-4 ml-1 mr-2" />;
};

export const RowBetween = ({ children }: { children: ReactNode }) => {
  return (
    <div className={clsx("p-0 flex w-full items-center justify-between")}>
      {children}
    </div>
  );
};
