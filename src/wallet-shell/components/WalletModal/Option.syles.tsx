import React, { ReactNode } from "react";
import clsx from "clsx";

export const OptionCardLeft = ({ children }: { children: ReactNode }) => {
  return <div className="flex flex-col justify-center h-full">{children}</div>;
};

export const OptionCardClickable = ({
  children,
  onClick,
  active,
  clickable,
  disabled,
  id,
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  clickable?: boolean;
  disabled?: boolean;
  id: string;
}) => {
  return (
    <button
      className={clsx(
        active && "border-transparent",
        clickable &&
          "cursor-pointer hover:border hover:border-solid hover:border-pink-500",
        disabled && "opacity-50",
        "w-full border border-solid outline-none focus:shadow-md hover:shadow-md",
        "border-gray-200 flex flex-row items-center justify-between mt-1 p-4",
        "opacity-100 mt-0"
      )}
      onClick={onClick}
      id={id}
    >
      {children}
    </button>
  );
};

export const GreenCircle = () => {
  return (
    <div className="flex items-center justify-center text-green-500">
      <div className="flex flex-row items-center ">
        <div className="w-3 h-3 mr-3 bg-green-500 rounded-full"></div>
      </div>
    </div>
  );
};

export const HeaderText = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-row font-medium text-black font-base">
      {children}
    </div>
  );
};

export const SubHeader = ({ children }: { children: ReactNode }) => {
  return <div className="mt-1 text-xs text-black">{children}</div>;
};

export const IconWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col items-end justify-center md:items-center">
      {" "}
      {children}
    </div>
  );
};
