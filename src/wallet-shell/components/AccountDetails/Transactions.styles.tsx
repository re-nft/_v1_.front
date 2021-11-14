import React, { HTMLProps, ReactNode } from "react";
import { ExternalLink } from "../common/ExternalLink";

export const TransactionStatusText = ({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) => {
  return (
    <div className="flex items-center mr-2 hover:underline" id={id}>
      {children}
    </div>
  );
};

export const TransactionState = ({
  ...rest
}: Omit<HTMLProps<HTMLAnchorElement>, "as" | "ref" | "onClick"> & {
  href: string;
}) => {
  return (
    <ExternalLink
      className="flex items-center justify-between px-1 text-sm font-medium text-pink-500 no-underline"
      {...rest}
    />
  );
};
export const RowFixed = ({ children }: { children: ReactNode }) => {
  return <div className="flex flex-row">{children}</div>;
};
