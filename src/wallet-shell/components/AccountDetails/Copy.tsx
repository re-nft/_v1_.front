import React, { ReactNode } from "react";
import useCopyClipboard from "../../hooks/useCopyClipboard";

import { CheckCircle, Copy as CopyI } from "react-feather";

export const CopyIcon = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) => {
  return (
    <div
      className="flex flex-shrink-0 text-sm font-medium text-gray-400 no-underline cursor-pointer hover:text-gray-600 focus:text-gray-600 active:text-gray-600"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const TransactionStatusText = ({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) => {
  return (
    <div className="flex flex-row items-center ml-1 text-sm" id={id}>
      {children}
    </div>
  );
};
export function Copy(props: { toCopy: string; children?: React.ReactNode }) {
  const [isCopied, setCopied] = useCopyClipboard();

  return (
    <CopyIcon onClick={() => setCopied(props.toCopy)}>
      {isCopied ? (
        <TransactionStatusText>
          <CheckCircle size={"16"} />
          <TransactionStatusText>Copied</TransactionStatusText>
        </TransactionStatusText>
      ) : (
        <TransactionStatusText>
          <CopyI size={"16"} />
        </TransactionStatusText>
      )}
      {isCopied ? "" : props.children}
    </CopyIcon>
  );
}
