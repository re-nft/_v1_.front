import React, { useContext, useEffect, useMemo, useState } from "react";
import { CurrentAddressWrapper } from "../../contexts/CurrentAddressWrapper";
import GraphContext from "../../contexts/graph";
import UserContext from "../../contexts/UserProvider";
import { useLookupAddress } from "../../hooks/useLookupAddress";
import { InstallMetamask } from "../common/install-metamask";
import { ShortenPopover } from "../common/shorten-popover";
import { Jazzicon } from "@ukstv/jazzicon-react";

export const Connect: React.FC = () => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const { network, connect } = useContext(UserContext);
  const [username, setUsername] = useState<string>();
  const { userData } = useContext(GraphContext);
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
        <div className="btn" onClick={connect}>
          <div>Connect</div>
        </div>
      ) : (
        <div className="flex justify-center items-center px-3 md:px-0">
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
              <p className="font-display text-sm leading-tight">
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
                <div className="flex justify-center items-center space-x-2 focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-offset-purple-800 focus:ring-purple">
                  <ShortenPopover
                    longString={username || lookupAddress || currentAddress}
                    data-cy="metamask-connect-button"
                  />
                  <Jazzicon
                    address={"0xBAc675C310721717Cd4A37F6cbeA1F081b1C2a07"}
                    className="h-5 w-5"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
