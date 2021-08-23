import useClipboard from "react-use-clipboard";
import React, { useCallback, useContext, useEffect, useMemo } from "react";
import { SnackAlertContext } from "../contexts/SnackProvider";
import { LinkIcon } from "@heroicons/react/solid";

export const CopyLink: React.FC<{
  tokenId: string;
  address: string;
}> = ({ tokenId, address }) => {
  const { setError } = useContext(SnackAlertContext);
  const hasWindow = useMemo(() => {
    return typeof window !== "undefined";
  }, []);

  const copyLink = useMemo(() => {
    const href = hasWindow ? window.location.origin : "https://dapp.renft.io";
    return `${href}/rent/${address}/${tokenId}`;
  }, [hasWindow, address, tokenId]);

  const [isCopied, setCopied] = useClipboard(copyLink);

  useEffect(() => {
    if (isCopied) setError(`Link copied to the clipboard ${copyLink}`, "info");
  }, [isCopied, copyLink, setError]);

  const setMessageAndCopied = useCallback(() => {
    // set message twice, possible that copied, closed, and clicked on copy again...
    if (isCopied) setError(`Link copied to the clipboard ${copyLink}`, "info");
    setCopied();
  }, [isCopied, setError, setCopied, copyLink]);

  return (
    <button
      onClick={setMessageAndCopied}
      aria-label="copy"
      className="h-1 w-1 p-2 text-gray-400 fill-current"
    >
      <LinkIcon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
};
