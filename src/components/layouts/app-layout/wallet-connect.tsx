import React, { useEffect, useMemo, useState } from "react";
import { Jazzicon } from "@ukstv/jazzicon-react";
import { Menu } from "@headlessui/react";

import { useLookupAddress } from "renft-front/hooks/queries/useLookupAddress";
import { InstallMetamask } from "renft-front/components/common/install-metamask";
import { ShortenPopover } from "renft-front/components/common/shorten-popover";
import { useUserData } from "renft-front/hooks/store/useUserData";
import { useWallet } from "renft-front/hooks/store/useWallet";
import { useCurrentAddress } from "renft-front/hooks/misc/useCurrentAddress";

const RenderButton: React.FC<{
  menuButton: boolean;
  [s: string]: unknown;
}> = ({ children, menuButton, ...props }) => {
  return !menuButton ? (
    <button {...props}>{children}</button>
  ) : (
    <Menu.Button {...props}>{children}</Menu.Button>
  );
};

export const WalletConnect: React.FC<{
  menuButton?: boolean;
}> = ({ menuButton }) => {
  const currentAddress = useCurrentAddress();
  const { network, connect } = useWallet();
  const [username, setUsername] = useState<string>();
  const { userData } = useUserData();
  const lookupAddress = useLookupAddress();

  const hasWindow = useMemo(() => {
    return typeof window !== "undefined";
  }, []);

  const installMetaMask = useMemo(() => {
    return !hasWindow ? false : !(window?.web3 || window?.ethereum);
  }, [hasWindow]);

  useEffect(() => {
    if (userData?.name !== "") {
      setUsername(userData?.name);
    }
  }, [userData]);

  const networkNotSupported = useMemo(() => {
    return network && network !== process.env.NEXT_PUBLIC_NETWORK_SUPPORTED;
  }, [network]);

  return (
    <div data-testid="wallet-connect">
      {!installMetaMask && (!currentAddress || !network) ? (
        <button className="relative outline-none block" onClick={connect} data-testid="wallet-connect-button">
          <div className="relative py-1 text-rn-purple leading-5 font-display text-sm uppercase whitespace-nowrap border-b-4 border-white">
            Connect Wallet
          </div>
        </button>
      ) : (
        <div className="flex flex-col justify-end items-end lg:flex-row lg:justify-center lg:items-center md:px-0 font-display" data-testid="wallet-message">
          <div>
            <div className="text-sm leading-tight text-rn-purple border-b-4 border-white">
              <span className="uppercase" data-testid="wallet-network">{network}&nbsp;</span>
              {networkNotSupported && (
                <span className="text-black">is not supported</span>
              )}
            </div>
            {networkNotSupported && (
              <div className="text-sm leading-tight text-black">
                Please switch to&nbsp;
                <span className="text-rn-purple uppercase">
                  {process.env.NEXT_PUBLIC_NETWORK_SUPPORTED}
                </span>
              </div>
            )}
          </div>

          {!networkNotSupported && (
            <div className="text-rn-purple text-sm px-2 border-b-4 border-white" data-testid='wallet-address'>
              {installMetaMask && <InstallMetamask />}

              {!installMetaMask && !!currentAddress && (
                <RenderButton menuButton={!!menuButton} className="flex">
                  <span className="sr-only">Open user menu</span>
                  <div className="flex justify-center items-center space-x-2 focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-offset-purple-800 focus:ring-purple">
                    <ShortenPopover
                      longString={username || lookupAddress || currentAddress}
                      data-cy="metamask-connect-button"
                    />
                    <Jazzicon address={currentAddress} className="h-5 w-5" />
                  </div>
                </RenderButton>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
