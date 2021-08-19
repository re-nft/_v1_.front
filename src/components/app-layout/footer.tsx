import React, { useMemo } from "react";
import { useContractAddress } from "../../hooks/contract/useContractAddress";
import { NetworkName } from "../../types";
import address from "../../contracts/ReNFT.address";

export const Footer: React.FC = () => {
  const contractAddress = useContractAddress();

  const addressWithFallback = useMemo(() => {
    // need to fallback, even if we didn't load the contracts yet
    const addressWithFallback = contractAddress || address;
    return addressWithFallback;
  }, [contractAddress]);
  const etherScanUrl = useMemo(() => {
    if (process.env.NEXT_PUBLIC_NETWORK_SUPPORTED === NetworkName.ropsten) {
      return `https://ropsten.etherscan.io/address/${addressWithFallback}`;
    }
    return `https://etherscan.io/address/${addressWithFallback}`;
  }, [addressWithFallback]);

  return (
    <div className="content-wrapper footer">
      <div className="footer__message font-VT323">
        Contracts have been thoroughly tested and peer reviewed, but not
        audited. Use at your own risk.
        <a
          style={{ fontSize: "14px", display: "block" }}
          href={etherScanUrl}
          target="_blank"
          rel="noreferrer"
        >
          Contract on etherscan: {addressWithFallback}
        </a>
      </div>
      <div className="footer__content">
        <div className="copy">2021 ReNFT</div>
        <div className="copy">
          App version: {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}
        </div>
        <div className="soc">
          <a
            href="https://discord.gg/ka2u9n5sWs"
            target="_blank"
            rel="noreferrer"
          >
            <span className="discord"></span>
          </a>
          <a
            href="https://twitter.com/renftlabs"
            target="_blank"
            rel="noreferrer"
          >
            <span className="twitter"></span>
          </a>
        </div>
      </div>
    </div>
  );
};
