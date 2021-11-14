import React, { ReactNode } from "react";

export const HeaderElement = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-row-reverse items-center justify-end md:flex-row ">
      {children}
    </div>
  );
};

export const AccountElement = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-row items-center w-full bg-gray-200 cursor-pointer pointer-events-auto whitespace-nowrap focus:border-blue-300 focus:border-solid focus:border">
      {children}
    </div>
  );
};

export const NetworkCard = ({ children }: { children: ReactNode }) => {
  return (
    <div className="hidden p-2 mr-2 font-medium text-yellow-600 bg-yellow-700 bg-opacity-5 sm:block">
      {children}
    </div>
  );
};
export const BalanceText = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex-shrink-0 hidden px-2 text-base md:block font-weight-medium">
      {children}
    </div>
  );
};
