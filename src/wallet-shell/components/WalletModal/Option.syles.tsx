import React from "react";
import clsx from "clsx";

export const OptionCardLeft: React.FC = ({ children }) => {
  return <div className="flex flex-col justify-center h-full">{children}</div>;
};

export const OptionCardClickable: React.FC<{
  onClick?: () => void;
  active?: boolean;
  clickable?: boolean;
  disabled?: boolean;
  id: string;
}> = ({ children, onClick, active, clickable, disabled, id }) => {
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

export const GreenCircle: React.FC = () => {
  return (
    <div className="flex items-center justify-center text-green-500">
      <div className="flex flex-row items-center ">
        <div className="w-3 h-3 mr-3 bg-green-500 rounded-full"></div>
      </div>
    </div>
  );
};

export const HeaderText: React.FC = ({ children }) => {
  return (
    <div className="flex flex-row font-medium text-black font-base">
      {children}
    </div>
  );
};

export const SubHeader: React.FC = ({ children }) => {
  return <div className="mt-1 text-xs text-black">{children}</div>;
};

export const IconWrapper: React.FC = ({ children }) => {
  return (
    <div className="flex flex-col items-end justify-center md:items-center">
      {" "}
      {children}
    </div>
  );
};
