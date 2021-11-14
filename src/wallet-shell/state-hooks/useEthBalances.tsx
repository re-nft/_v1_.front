// TODO remove uniswap sdk
import { CurrencyAmount, JSBI } from "@uniswap/sdk";
import {
  useMulticallContract,
  useSingleContractMultipleData,
} from "./useContract";
import { useMemo } from "react";
import { isAddress } from "../utils";

/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
 */
export function useETHBalances(uncheckedAddresses?: (string | undefined)[]): {
  [address: string]: CurrencyAmount | undefined;
} {
  const multicallContract = useMulticallContract();

  const addresses: string[] = useMemo(
    () =>
      uncheckedAddresses
        ? uncheckedAddresses
            .map(isAddress)
            .filter((a): a is string => a !== false)
            .sort()
        : [],
    [uncheckedAddresses]
  );

  const results = useSingleContractMultipleData(
    multicallContract,
    "getEthBalance",
    addresses.map((address) => [address])
  );

  return useMemo(
    () =>
      addresses.reduce<{ [address: string]: CurrencyAmount }>(
        (memo, address, i) => {
          const value = results?.[i]?.result?.[0];
          if (value)
            memo[address] = CurrencyAmount.ether(JSBI.BigInt(value.toString()));
          return memo;
        },
        {}
      ),
    [addresses, results]
  );
}
