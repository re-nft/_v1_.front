import React from "react";
import useCopyClipboard from "../../hooks/useCopyClipboard";
import { CheckCircleIcon as CheckCircle } from "@heroicons/react/outline";
import { ClipboardCopyIcon as CopyI } from "@heroicons/react/outline";

export const CopyIcon: React.FC<{
  onClick: () => void;
}> = ({ children, onClick }) => {
  return (
    <div
      className="flex flex-shrink-0 text-sm font-medium text-gray-400 no-underline cursor-pointer hover:text-gray-600 focus:text-gray-600 active:text-gray-600"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const TransactionStatusText: React.FC<{
  id?: string;
}> = ({ children, id }) => {
  return (
    <div className="flex flex-row items-center ml-1 text-sm" id={id}>
      {children}
    </div>
  );
};
export const Copy: React.FC<{ toCopy: string }> = (props) => {
  const [isCopied, setCopied] = useCopyClipboard();

  return (
    <CopyIcon onClick={() => setCopied(props.toCopy)}>
      {isCopied ? (
        <TransactionStatusText>
          <span className="w-4 h-4">
            <CheckCircle />
          </span>
          <TransactionStatusText>Copied</TransactionStatusText>
        </TransactionStatusText>
      ) : (
        <TransactionStatusText>
          <span className="w-4 h-4">
            <CopyI />
          </span>
        </TransactionStatusText>
      )}
      {isCopied ? "" : props.children}
    </CopyIcon>
  );
};
