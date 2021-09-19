import React, { useEffect, useMemo, useState } from "react";
import { useLookupAddress } from "../../../hooks/queries/useLookupAddress";
import { InstallMetamask } from "../../common/install-metamask";
import { ShortenPopover } from "../../common/shorten-popover";
import { Jazzicon } from "@ukstv/jazzicon-react";
import { useUserData } from "../../../hooks/store/useUserData";
import { useWallet } from "../../../hooks/store/useWallet";
import { useCurrentAddress } from "../../../hooks/misc/useCurrentAddress";
import { Menu } from "@headlessui/react";

const RenderButton: React.FC<{
  menuButton: boolean,
  [s:string]: any
}> = ({ children, menuButton, ...props }) => {
  return !menuButton ? (
    <button {...props}>{children}</button>
  ) : (
    <Menu.Button {...props}>{children}</Menu.Button>
  );
};
export const Connect: React.FC<{
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
    return network !== process.env.NEXT_PUBLIC_NETWORK_SUPPORTED;
  }, [network]);

 
  return (
    <>
      {!installMetaMask && (!currentAddress || !network) ? (
        <button className="relative outline-none block" onClick={connect}>
          <div className="relative py-1 text-rn-purple leading-5 text-xl whitespace-nowrap border-b-4 border-white">
            Connect Wallet
          </div>
        </button>
      ) : (
        <div className="flex flex-col justify-end items-end lg:flex-row lg:justify-center lg:items-center md:px-0 font-body">
          <div>
            <p className="text-xl leading-tight text-rn-purple border-b-4 border-white">
              {network} &nbsp;
              {networkNotSupported && (
                <span className="text-xl leading-tight text-black">
                  is not supported
                </span>
              )}
            </p>
            {networkNotSupported && (
              <p className="text-xl leading-tight text-black">
                Please switch to{" "}
                <span className="text-xl leading-loose text-rn-purple">
                  {process.env.NEXT_PUBLIC_NETWORK_SUPPORTED}
                </span>
              </p>
            )}
          </div>

          {!networkNotSupported && (
            <div className="text-rn-purple text-xl px-2 border-b-4 border-white">
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
    </>
  );
};
