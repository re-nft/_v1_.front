import { X as Close } from "react-feather";
import React, { ReactNode } from "react";
import clsx from "clsx";

export const CloseIcon = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="absolute right-4 top-4 hover:cursor-pointer hover:opacity-60"
    >
      {children}
    </button>
  );
};

export const CloseColor = () => {
  return <Close className="closeButton" />;
};

export const Wrapper = ({ children }: { children: ReactNode }) => {
  return <div className="w-full">{children}</div>;
};

export const HeaderRow = ({
  children,
  isBlue,
}: {
  children: ReactNode;
  isBlue?: boolean;
}) => {
  return (
    <div className={clsx(isBlue && "text-blue-500", "p-4 font-medium")}>
      {children}
    </div>
  );
};

export const ContentWrapper = ({ children }: { children: ReactNode }) => {
  return <div className="p-3 md:p-6">{children}</div>;
};

export const UpperSection = ({ children }: { children: ReactNode }) => {
  return <div className="relative">{children}</div>;
};

export const Blurb = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-row flex-wrap items-center justify-center m-4 text-xs md:text-base md:m-0 md:mt-8">
      {children}
    </div>
  );
};

export const OptionGrid = ({ children }: { children: ReactNode }) => {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-none">{children}</div>
  );
};

export const HoverText = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) => {
  return (
    <button className="cursor-pointer" onClick={onClick}>
      {children}
    </button>
  );
};
