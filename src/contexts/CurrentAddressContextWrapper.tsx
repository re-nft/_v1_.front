import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { CurrentAddressContext } from "../hardhat/SymfoniContext";

export const CurrentAddressContextWrapper = createContext<
  [string, React.Dispatch<React.SetStateAction<string>>]
  // eslint-disable-next-line @typescript-eslint/no-empty-function
>(["", () => {}]);

export const CurrentAddressContextWrapperProvider: React.FC = ({
  children,
}) => {
  const [currentAddress, setAddress] = useContext(CurrentAddressContext);
  const [newAddress, setNewAddress] = useState(currentAddress);
  useEffect(() => {
    if (process.env.REACT_APP_ADDRESS) {
      setNewAddress(process.env.REACT_APP_ADDRESS);
    } else {
      setNewAddress(currentAddress);
    }
  }, [currentAddress]);

  return (
    <CurrentAddressContextWrapper.Provider value={[newAddress, setAddress]}>
      {children}
    </CurrentAddressContextWrapper.Provider>
  );
};
