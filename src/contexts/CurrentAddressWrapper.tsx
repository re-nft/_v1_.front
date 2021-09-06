import React, { createContext, useState, useEffect } from "react";
import { usePrevious } from "../hooks/usePrevious";
import { useWallet } from "../hooks/useWallet";

export const CurrentAddressWrapper = createContext<string>("");

CurrentAddressWrapper.displayName = "CurrentAddressWrapper";

export const CurrentAddressProvider: React.FC = ({ children }) => {
  const { address } = useWallet();
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
