import useClipboard from "react-use-clipboard";
import React, { useCallback, useEffect, useMemo } from "react";
import LinkIcon from "@heroicons/react/solid/LinkIcon";
import { useSnackProvider } from "../hooks/store/useSnackProvider";

export const CopyLink: React.FC<{
  tokenId: string;
  address: string;
}> = ({ tokenId, address }) => {
  const { setError } = useSnackProvider();
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
      className="h-7 w-7 text-gray-700 fill-current"
    >
      <LinkIcon className="h-7 w-7" aria-hidden="true" />
    </button>
  );
};
