import { Contract } from "@ethersproject/contracts";
import {
  getContract,
  parseCallKey,
  toCallKey,
  toCallState,
  isValidMethodArgs,
} from "../utils";
import { useContext, useMemo, useEffect } from "react";
import {
  CallResult,
  INVALID_RESULT,
  OptionalMethodInputs,
  CallState,
  ListenerOptions,
  Call,
} from "../types";
import ENS_ABI from "../constants/abis/ens-registrar.json";
import ENS_PUBLIC_RESOLVER_ABI from "../constants/abis/ens-public-resolver.json";

// Instead of redux just use a Web3Status which groups together the required state for wallet connect related features
import { Web3StatusState, Web3StatusActions } from "../index.provider";
import { useActiveWeb3React } from "./useActiveWeb3React";
import { ChainId } from "../constants";

// returns null on errors
function useContract(
  address: string | undefined,
  ABI: Record<string, unknown>,
  withSignerIfPossible = true
): Contract | null {
  const { library, account } = useActiveWeb3React();

  return useMemo(() => {
    if (!address || !ABI || !library) return null;
    try {
      return getContract(
        address,
        ABI,
        library,
        withSignerIfPossible && account ? account : undefined
      );
    } catch (error) {
      console.error("Failed to get contract", error);
      return null;
    }
  }, [address, ABI, library, withSignerIfPossible, account]);
}

// the lowest level call for subscribing to contract data
function useCallsData(
  calls: (Call | undefined)[],
  options?: ListenerOptions
): CallResult[] {
  const { chainId } = useActiveWeb3React();
  const {
    multicall: { callResults },
  } = useContext(Web3StatusState);
  const { addMulticallListeners, removeMulticallListeners } =
    useContext(Web3StatusActions);
  const serializedCallKeys: string = useMemo(
    () =>
      JSON.stringify(
        calls
          ?.filter((c): c is Call => Boolean(c))
          ?.map(toCallKey)
          ?.sort() ?? []
      ),
    [calls]
  );
  // update listeners when there is an actual change that persists for at least 100ms
  useEffect(() => {
    const callKeys: string[] = JSON.parse(serializedCallKeys);
    if (!chainId || callKeys.length === 0) return undefined;
    const calls = callKeys.map((key) => parseCallKey(key));
    addMulticallListeners({
      chainId,
      calls,
      options,
    });

    return () => {
      removeMulticallListeners({
        chainId,
        calls,
        options,
      });
    };
  }, [
    addMulticallListeners,
    chainId,
    options,
    removeMulticallListeners,
    serializedCallKeys,
  ]);
  return useMemo(
    () =>
      calls.map<CallResult>((call) => {
        if (!chainId || !call) return INVALID_RESULT;

        const result = callResults[chainId]?.[toCallKey(call)];
        let data;
        if (result?.data && result?.data !== "0x") {
          data = result.data;
        }

        return { valid: true, data, blockNumber: result?.blockNumber };
      }),
    [callResults, calls, chainId]
  );
}
export function useBlockNumber(): number | undefined {
  const { chainId } = useActiveWeb3React();
  const {
    application: { blockNumber },
  } = useContext(Web3StatusState);
  return blockNumber[chainId ?? -1];
}

export function useSingleCallResult(
  contract: Contract | null | undefined,
  methodName: string,
  inputs?: OptionalMethodInputs,
  options?: ListenerOptions
): CallState {
  const fragment = useMemo(
    () => contract?.interface?.getFunction(methodName),
    [contract, methodName]
  );

  const calls = useMemo<Call[]>(() => {
    return contract && fragment && isValidMethodArgs(inputs)
      ? [
          {
            address: contract.address,
            callData: contract.interface.encodeFunctionData(fragment, inputs),
          },
        ]
      : [];
  }, [contract, fragment, inputs]);

  const result = useCallsData(calls, options)[0];
  const latestBlockNumber = useBlockNumber();

  return useMemo(() => {
    return toCallState(
      result,
      contract?.interface,
      fragment,
      latestBlockNumber
    );
  }, [result, contract, fragment, latestBlockNumber]);
}

export function useENSRegistrarContract(
  withSignerIfPossible?: boolean
): Contract | null {
  const { chainId } = useActiveWeb3React();
  let address: string | undefined;
  if (chainId) {
    switch (chainId) {
      case ChainId.MAINNET:
      case ChainId.GÖRLI:
      case ChainId.ROPSTEN:
      case ChainId.RINKEBY:
        address = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
        break;
    }
  }
  return useContract(
    address,
    ENS_ABI as any as Record<string, unknown>,
    withSignerIfPossible
  );
}

export function useENSResolverContract(
  address: string | undefined,
  withSignerIfPossible?: boolean
): Contract | null {
  return useContract(
    address,
    ENS_PUBLIC_RESOLVER_ABI as any as Record<string, unknown>,
    withSignerIfPossible
  );
}
