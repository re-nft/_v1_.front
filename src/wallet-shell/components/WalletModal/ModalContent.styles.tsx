import React from "react";
import clsx from "clsx";
import { XIcon as Close } from "@heroicons/react/outline";

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

export const CloseColor: React.FC = () => {
  return (
    <span className="h-4 w-4 flex">
      <Close />
    </span>
  );
};

export const Wrapper: React.FC = ({ children }) => {
  return <div className="w-full">{children}</div>;
};

export const HeaderRow: React.FC<{
  isBlue?: boolean;
}> = ({ children, isBlue }) => {
  return (
    <div className={clsx(isBlue && "text-blue-500", "p-4 font-medium")}>
      {children}
    </div>
  );
};

export const ContentWrapper: React.FC = ({ children }) => {
  return <div className="p-3 md:p-6">{children}</div>;
};

export const UpperSection: React.FC = ({ children }) => {
  return <div className="relative">{children}</div>;
};

export const Blurb: React.FC = ({ children }) => {
  return (
    <div className="flex flex-row flex-wrap items-center justify-center m-4 text-xs md:text-base md:m-0 md:mt-8">
      {children}
    </div>
  );
};

export const OptionGrid: React.FC = ({ children }) => {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-none">{children}</div>
  );
};

export const HoverText: React.FC<{
  onClick?: () => void;
}> = ({ children, onClick }) => {
  return (
    <button className="cursor-pointer" onClick={onClick}>
      {children}
    </button>
  );
};
