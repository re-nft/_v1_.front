import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
} from "react";
import UserContext from "./UserProvider";

export const CurrentAddressWrapper = createContext<string>("");

CurrentAddressWrapper.displayName = "CurrentAddressWrapper";

export const CurrentAddressProvider: React.FC = ({
  children,
}) => {
  const { address } = useContext(UserContext);
  const [newAddress, setNewAddress] = useState(address);
  useEffect(() => {
    if (process.env.REACT_APP_ADDRESS) {
      setNewAddress(process.env.REACT_APP_ADDRESS);
    } else {
      setNewAddress(address);
    }
  }, [address]);

  return (
    <CurrentAddressWrapper.Provider value={address}>
      {children}
    </CurrentAddressWrapper.Provider>
  );
};
