import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CurrentAddressWrapper } from "../../contexts/CurrentAddressWrapper";
import GraphContext from "../../contexts/graph";
import UserContext from "../../contexts/UserProvider";
import { useLookupAddress } from "../../hooks/useLookupAddress";
import { Button } from "../common/button";
import { InstallMetamask } from "../common/install-metamask";
import { ShortenPopover } from "../common/shorten-popover";

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
  return (
    <div className="header">
      <div className="header__logo"></div>
      {!installMetaMask && !currentAddress ? (
        <Button
          datacy="metamask-connect-button"
          handleClick={connect}
          description="Please connect your wallet!"
        />
      ) : (
        <div className="header__user">
          {installMetaMask && <InstallMetamask />}

          {!installMetaMask && !!currentAddress && (
            <>
              {network} &nbsp;
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
  );
};
