import { Loader } from "../common/Loader";
import { ReactNode } from "react";
import clsx from "clsx";
import React from "react";

export const PendingSection = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      {children}
    </div>
  );
};

export const StyledLoader = () => {
  return <Loader className="mr-4" />;
};

export const LoadingMessage = ({
  children,
  hasError,
}: {
  children: ReactNode;
  hasError?: boolean;
}) => {
  return (
    <div
      className={clsx(
        hasError && "color-red-500 border-red-500",
        "flex flex-row items-center justify-start w-full p-4 mb-5 border border-gray-200 border-solid"
      )}
    >
      {children}
    </div>
  );
};

export const ErrorGroup = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-row items-center justify-between w-full">
      {children}
    </div>
  );
};

export const ErrorButton = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="justify-end p-2 ml-4 text-sm font-semibold bg-gray-200 select-none color-black hover:cursor-pointer hover:bg-gray-400"
    >
      {children}
    </button>
  );
};

export const LoadingWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-row items-center w-full justify-content">
      {children}
    </div>
  );
};
