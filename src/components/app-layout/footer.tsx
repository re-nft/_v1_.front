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
    <div className="max-w-7xl mx-auto flex text-sm font-body leading-tight min-h-full w-full px-8">
      <div className="flex w-full flex-col footer items-center justify-center my-8">
        <div className="flex-1 text-center text-rn-red text-xl ">
          Contracts have been thoroughly tested and peer reviewed, but not
          audited. Use at your own risk.
          <a
            style={{ fontSize: "14px", display: "block" }}
            href={etherScanUrl}
            target="_blank"
            rel="noreferrer"
            className="underline text-black hover:text-rn-purple"
          >
            Contract on etherscan: {addressWithFallback}
          </a>
        </div>
        <div className="flex-1 w-full flex mt-8 items-end">
          <div className="flex-1">2021 ReNFT</div>
          <div className="flex-1 text-center">
            App version: {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}
          </div>
          <div className="flex-1 flex items-end justify-end">
            <a
              href="https://discord.gg/ka2u9n5sWs"
              target="_blank"
              rel="noreferrer"
            >
              <img src="/assets/discord.png" className="w-10 h-10" />
            </a>
            <a
              href="https://twitter.com/renftlabs"
              target="_blank"
              rel="noreferrer"
            >
              <img src="/assets/twitter.png" className="w-10 h-10" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
