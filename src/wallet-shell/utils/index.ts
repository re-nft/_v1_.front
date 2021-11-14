import { getAddress } from "@ethersproject/address";
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import { AddressZero } from "@ethersproject/constants";
import { Contract } from "@ethersproject/contracts";
import { Interface, FunctionFragment } from "@ethersproject/abi";
import {
  CallState,
  Call,
  CallResult,
  Result,
  TransactionDetails,
  MethodArgs,
  MethodArg,
} from "../types";
import { ChainId } from "@uniswap/sdk";

const INVALID_CALL_STATE: CallState = {
  valid: false,
  result: undefined,
  loading: false,
  syncing: false,
  error: false,
};
const LOADING_CALL_STATE: CallState = {
  valid: true,
  result: undefined,
  loading: true,
  syncing: true,
  error: false,
};

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const LOWER_HEX_REGEX = /^0x[a-f0-9]*$/;

export function parseCallKey(callKey: string): Call {
  const pcs = callKey.split("-");
  if (pcs.length !== 2) {
    throw new Error(`Invalid call key: ${callKey}`);
  }
  return {
    address: pcs[0],
    callData: pcs[1],
  };
}

export function toCallKey(call: Call): string {
  if (!ADDRESS_REGEX.test(call.address)) {
    throw new Error(`Invalid address: ${call.address}`);
  }
  if (!LOWER_HEX_REGEX.test(call.callData)) {
    throw new Error(`Invalid hex: ${call.callData}`);
  }
  return `${call.address}-${call.callData}`;
}

export function toCallState(
  callResult: CallResult | undefined,
  contractInterface: Interface | undefined,
  fragment: FunctionFragment | undefined,
  latestBlockNumber: number | undefined
): CallState {
  if (!callResult) return INVALID_CALL_STATE;
  const { valid, data, blockNumber } = callResult;
  if (!valid) return INVALID_CALL_STATE;
  if (valid && !blockNumber) return LOADING_CALL_STATE;
  if (!contractInterface || !fragment || !latestBlockNumber)
    return LOADING_CALL_STATE;
  const success = data && data.length > 2;
  const syncing = (blockNumber ?? 0) < latestBlockNumber;
  let result: Result | undefined = undefined;
  if (success && data) {
    try {
      result = contractInterface.decodeFunctionResult(fragment, data);
    } catch (error) {
      console.debug("Result data parsing failed", fragment, data);
      return {
        valid: true,
        loading: false,
        error: true,
        syncing,
        result,
      };
    }
  }
  return {
    valid: true,
    loading: false,
    syncing,
    result: result,
    error: !success,
  };
}
// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}
const ETHERSCAN_PREFIXES: { [_chainId in ChainId]: string } = {
  1: "",
  3: "ropsten.",
  4: "rinkeby.",
  5: "goerli.",
  42: "kovan.",
};

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address);
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`;
}

export function getEtherscanLink(
  chainId: ChainId,
  data: string,
  type: "transaction" | "token" | "address" | "block"
): string {
  const prefix = `https://${
    ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]
  }etherscan.io`;

  switch (type) {
    case "transaction": {
      return `${prefix}/tx/${data}`;
    }
    case "token": {
      return `${prefix}/token/${data}`;
    }
    case "block": {
      return `${prefix}/block/${data}`;
    }
    case "address":
    default: {
      return `${prefix}/address/${data}`;
    }
  }
}

// we want the latest one to come first, so return negative if a is after b
export function newTransactionsFirst(
  a: TransactionDetails,
  b: TransactionDetails
) {
  return b.addedTime - a.addedTime;
}

// account is not optional
export function getSigner(
  library: Web3Provider,
  account: string
): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked();
}
// account is optional
export function getProviderOrSigner(
  library: Web3Provider,
  account?: string
): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library;
}
// account is optional
export function getContract(
  address: string,
  ABI: any,
  library: Web3Provider,
  account?: string
): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }

  return new Contract(
    address,
    ABI,
    getProviderOrSigner(library, account) as any
  );
}

// chunks array into chunks of maximum size
// evenly distributes items among the chunks
export function chunkArray<T>(items: T[], maxChunkSize: number): T[][] {
  if (maxChunkSize < 1) throw new Error("maxChunkSize must be gte 1");
  if (items.length <= maxChunkSize) return [items];

  const numChunks: number = Math.ceil(items.length / maxChunkSize);
  const chunkSize = Math.ceil(items.length / numChunks);

  return [...Array(numChunks).keys()].map((ix) =>
    items.slice(ix * chunkSize, ix * chunkSize + chunkSize)
  );
}

/**
 * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param tx to check for recency
 */
export function isTransactionRecent(tx: TransactionDetails): boolean {
  return new Date().getTime() - tx.addedTime < 86_400_000;
}

/**
 * Returns true if the string value is zero in hex
 * @param hexNumberString
 */
export function isZero(hexNumberString: string) {
  return /^0x0*$/.test(hexNumberString);
}

function isMethodArg(x: unknown): x is MethodArg {
  return ["string", "number"].indexOf(typeof x) !== -1;
}

export function isValidMethodArgs(x: unknown): x is MethodArgs | undefined {
  return (
    x === undefined ||
    (Array.isArray(x) &&
      x.every(
        (xi) => isMethodArg(xi) || (Array.isArray(xi) && xi.every(isMethodArg))
      ))
  );
}
