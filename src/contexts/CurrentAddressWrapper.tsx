import React, { createContext, useState, useContext, useEffect } from "react";
import { usePrevious } from "../hooks/usePrevious";
import UserContext from "./UserProvider";

export const CurrentAddressWrapper = createContext<string>("");

CurrentAddressWrapper.displayName = "CurrentAddressWrapper";

export const CurrentAddressProvider: React.FC = ({ children }) => {
  const { address } = useContext(UserContext);
  const [newAddress, setNewAddress] = useState(address);
  const previousAddress = usePrevious(newAddress);
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ADDRESS) {
      setNewAddress(process.env.NEXT_PUBLIC_ADDRESS);
    } else {
      if (previousAddress !== address) setNewAddress(address);
    }
  }, [address, previousAddress]);

  return (
    <CurrentAddressWrapper.Provider value={newAddress}>
      {children}
    </CurrentAddressWrapper.Provider>
  );
};
