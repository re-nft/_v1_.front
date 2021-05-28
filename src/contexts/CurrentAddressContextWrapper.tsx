import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
} from "react";
import UserContext from "./UserProvider";

export const CurrentAddressContextWrapper = createContext<string>("");

CurrentAddressContextWrapper.displayName = "CurrentAddressContextWrapper";

export const CurrentAddressContextWrapperProvider: React.FC = ({
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
    <CurrentAddressContextWrapper.Provider value={address}>
      {children}
    </CurrentAddressContextWrapper.Provider>
  );
};
