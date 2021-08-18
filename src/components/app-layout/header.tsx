import React, { useContext, useEffect, useMemo, useState } from "react";
import { CurrentAddressWrapper } from "../../contexts/CurrentAddressWrapper";
import GraphContext from "../../contexts/graph";
import UserContext from "../../contexts/UserProvider";
import { useLookupAddress } from "../../hooks/useLookupAddress";
import { Button } from "../common/button";
import { InstallMetamask } from "../common/install-metamask";
import { ShortenPopover } from "../common/shorten-popover";
import Link from "next/link";

export const Header: React.FC = () => {
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
    <div className="header">
      <div className="header__logo"></div>
      {!installMetaMask && (!currentAddress || !network) ? (
        <Button
          datacy="metamask-connect-button"
          onClick={connect}
          description="Connect"
        />
      ) : (
        <div className="header__wallet">
          <div className="header__wallet-network">
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
            <div className="header__wallet-user">
              {installMetaMask && <InstallMetamask />}

              {!installMetaMask && !!currentAddress && (
                <>
                  <Link href="/profile">
                    <a>
                      <ShortenPopover
                        longString={username || lookupAddress || currentAddress}
                        data-cy="metamask-connect-button"
                      />
                    </a>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
