import React, { useEffect, useMemo, useState } from "react";
import { useLookupAddress } from "../../hooks/queries/useLookupAddress";
import { InstallMetamask } from "../common/install-metamask";
import { ShortenPopover } from "../common/shorten-popover";
import { Jazzicon } from "@ukstv/jazzicon-react";
import { useUserData } from "../../hooks/queries/useUserData";
import { useWallet } from "../../hooks/useWallet";
import { useCurrentAddress } from "../../hooks/useCurrentAddress";
import { Menu } from "@headlessui/react";

export const Connect: React.FC = () => {
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
        <button
          className="relative outline-none block p-1 bg-black"
          onClick={connect}
        >
          <div className="relative py-3 px-4 bg-rn-green shadow-rn-drop-green text-white leading-none font-display uppercase text-sm whitespace-nowrap -top-2 -left-2 hover:bg-rn-orange hover:shadow-rn-drop-orange">
            Connect
          </div>
        </button>
      ) : (
        <div className="flex justify-center items-center px-3 md:px-0 font-body">
          <div>
            <p className="font-display text-sm leading-tight text-rn-purple">
              {network} &nbsp;
              {networkNotSupported && (
                <span className="text-sm leading-tight text-black">
                  is not supported
                </span>
              )}
            </p>
            {networkNotSupported && (
              <p className="font-display text-sm leading-tight text-black">
                Please switch to{" "}
                <span className="font-display text-sm leading-loose text-rn-purple">
                  {process.env.NEXT_PUBLIC_NETWORK_SUPPORTED}
                </span>
              </p>
            )}
          </div>

          {!networkNotSupported && (
            <div className="shadow-rn-one text-rn-purple text-lg border-4 border-black px-2 py-2">
              {installMetaMask && <InstallMetamask />}

              {!installMetaMask && !!currentAddress && (
                <Menu.Button className="flex">
                  <span className="sr-only">Open user menu</span>
                  <div className="flex justify-center items-center space-x-2 focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-offset-purple-800 focus:ring-purple">
                    <ShortenPopover
                      longString={username || lookupAddress || currentAddress}
                      data-cy="metamask-connect-button"
                    />
                    <Jazzicon address={currentAddress} className="h-5 w-5" />
                  </div>
                </Menu.Button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
