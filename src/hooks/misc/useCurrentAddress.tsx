import produce from "immer";
import { useCallback, useEffect } from "react";
import create from "zustand";
import shallow from "zustand/shallow";
import { usePrevious } from "./usePrevious";
import { useWallet } from "../store/useWallet";
import { devtools } from "zustand/middleware";

const useCurrentAddressState = create<{
  address: string;
  setAddress: (r: string) => void;
}>(devtools((set) => ({
  address: "",
  setAddress: (r: string) =>
    set(
      produce((state) => {
        state.address = r;
      })
    ),
})));

export const useCurrentAddress = ():string => {
  const { address } = useWallet();
  const newAddress = useCurrentAddressState(
    useCallback((state) => state.address, []),
    shallow
  );
  const setNewAddress = useCurrentAddressState((state) => state.setAddress);
  const previousAddress = usePrevious(newAddress);
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ADDRESS) {
      setNewAddress(process.env.NEXT_PUBLIC_ADDRESS);
    } else {
      if (previousAddress !== address) setNewAddress(address);
    }
  }, [address, previousAddress, setNewAddress]);
  return newAddress;
};
