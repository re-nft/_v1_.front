import useClipboard from "react-use-clipboard";
import LinkIcon from "@material-ui/icons/Link";
import IconButton from "@material-ui/core/IconButton";
import React, { useContext, useEffect, useMemo } from "react";
import { SnackAlertContext } from "../contexts/SnackProvider";

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

  return (
    <IconButton onClick={setCopied} size="small" aria-label="copy">
      <LinkIcon />
    </IconButton>
  );
};
