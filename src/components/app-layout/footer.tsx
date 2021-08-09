import React, { useContext, useMemo } from "react";
import UserContext from "../../contexts/UserProvider";
import { useContractAddress } from "../../hooks/contract/useContractAddress";
import { NetworkName } from "../../types";

export const Footer: React.FC = () => {
  const contractAddress = useContractAddress();

  const etherScanUrl = useMemo(() => {
    if (process.env.NEXT_PUBLIC_NETWORK_SUPPORTED === NetworkName.ropsten) {
      return "https://ropsten.etherscan.io/address";
    }
    return "https://etherscan.io/address";
  }, []);
  return (
    <div className="content-wrapper footer">
      <div className="footer__message font-VT323">
        Contracts have been thoroughly tested and peer reviewed, but not
        audited. Use at your own risk.
        <a
            style={{ fontSize: "14px", display: "block" }}
            href={`${etherScanUrl}/${contractAddress}`}
            target="_blank"
            rel="noreferrer"
          >
            Contract on etherscan: ${contractAddress}
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
