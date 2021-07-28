import { IconButton } from "@material-ui/core";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CurrentAddressWrapper } from "../../contexts/CurrentAddressWrapper";
import GraphContext from "../../contexts/graph";
import UserContext from "../../contexts/UserProvider";
import { useLookupAddress } from "../../hooks/useLookupAddress";
import { Button } from "../common/button";
import { InstallMetamask } from "../common/install-metamask";
import { ShortenPopover } from "../common/shorten-popover";
import MenuIcon from '@material-ui/icons/Menu';

export const Header = () => {
  const currentAddress = useContext(CurrentAddressWrapper);
  const { network, connect } = useContext(UserContext);
  const [username, setUsername] = useState<string>();
  const { userData } = useContext(GraphContext);

  const installMetaMask = !(window.web3 || window.ethereum);
  const lookupAddress = useLookupAddress();
  useEffect(() => {
    if (userData?.name !== "") {
      setUsername(userData?.name);
    }
  }, [userData]);
  const networkNotSupported = useMemo(() => {
    return network !== process.env.REACT_APP_NETWORK_SUPPORTED;
  }, [network]);
  return (
    <div className="header">
      <div className="header__logo"></div>
      {!installMetaMask && !currentAddress ? (
        <Button
          datacy="metamask-connect-button"
          onClick={connect}
          description="Please connect your wallet!"
        />
      ) : (
        <div className="header__wallet">
          <div className="header__wallet-network">
            <p className="headline pink-text">
              {network} &nbsp;{" "}
              {networkNotSupported && (
                <span className="copy-text black-text">is not supported</span>
              )}
            </p>
            {networkNotSupported && (
              <p className="copy-text">
                Please switch to{" "}
                <span className="headline pink-text">
                  {process.env.REACT_APP_NETWORK_SUPPORTED}
                </span>
              </p>
            )}
          </div>

          {!networkNotSupported && (
            <div className="header__wallet-user">
              {installMetaMask && <InstallMetamask />}

              {!installMetaMask && !!currentAddress && (
                <>
                  <Link className="" to="/profile">
                    <ShortenPopover
                      longString={username || lookupAddress || currentAddress}
                      data-cy="metamask-connect-button"
                    />
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
