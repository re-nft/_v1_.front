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
  const installMetaMask = useMemo(() => {
    const noProvider =
      typeof window === "undefined"
        ? false
        : typeof window?.web3 === "undefined" &&
          typeof window?.ethereum === "undefined";
    return noProvider;
  }, [typeof window]);

  useEffect(() => {
    if (userData?.name !== "") {
      setUsername(userData?.name);
    }
  }, [userData]);

  const networkNotSupported = useMemo(() => {
    if (network == null) return false;
    if (network === "") return false;
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
            <p className="headline pink-text">
              {network} &nbsp;{" "}
              {networkNotSupported && (
                <span className="copy-text white-text">is not supported</span>
              )}
            </p>
            {networkNotSupported && (
              <p className="copy-text white-text">
                Please switch to{" "}
                <span className="headline pink-text">
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
