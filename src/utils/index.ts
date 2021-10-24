import { ERC721 } from "renft-front/types/typechain/ERC721";
import { ERC1155 } from "renft-front/types/typechain/ERC1155";
import { ERC20 } from "renft-front/types/typechain/ERC20";
import createDebugger from "debug";
import { Lending } from "renft-front/types/classes";
import { PaymentToken } from "@renft/sdk";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { Signer } from "@ethersproject/abstract-signer";
import { Contract } from "@ethersproject/contracts";
import { getAddress } from "@ethersproject/address";
import { ERC1155__factory } from "renft-front/contracts/ERC1155__factory";
import { ERC721__factory } from "renft-front/contracts/ERC721__factory";
import { RENFT_SUBGRAPH_ID_SEPARATOR } from "renft-front/consts";

import { unpackPrice } from "@renft/sdk";
import {
  ILending,
  ILendingWithoutCircularDeps,
  IRenting,
  LendingRaw,
  RentingRaw,
} from "../types";

// ENABLE with DEBUG=* or DEBUG=FETCH,Whatever,ThirdOption
const debug = createDebugger("app:timer");

export const short = (s: string): string =>
  `${s.substr(0, 7)}...${s.substr(s.length - 3, 3)}`;

export const THROWS = (): void => {
  throw new Error("must be implemented");
};

export const ASYNC_THROWS = async (): Promise<void> => {
  throw new Error("must be implemented");
};

export const getRandomInt = (max: number): number => {
  return Math.floor(Math.random() * Math.floor(max));
};

const e20abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint amount) returns (boolean)",
  "function approve(address spender, uint256 amount) returns (boolean)",
  "event Transfer(address indexed from, address indexed to, uint amount)",
];

export const getE20 = (address: string, signer?: Signer): ERC20 => {
  const erc20Contract = new Contract(
    getAddress(address),
    e20abi,
    signer
  ) as ERC20;
  return erc20Contract;
};

export const getE721 = (
  address: string,
  signer: Signer | JsonRpcProvider
): ERC721 => {
  const erc721Contract = ERC721__factory.connect(address, signer);
  return erc721Contract;
};

export const getE1155 = (
  address: string,
  signer: Signer | JsonRpcProvider
): ERC1155 => {
  const erc1155Contract = ERC1155__factory.connect(address, signer);
  return erc1155Contract;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const decimalToPaddedHexString = (
  number: number,
  bitsize: number
): string => {
  const byteCount = Math.ceil(bitsize / 8);
  const maxBinValue = Math.pow(2, bitsize) - 1;
  if (bitsize > 32) throw "number above maximum value";
  if (number < 0) number = maxBinValue + number + 1;
  return (
    "0x" +
    (number >>> 0)
      .toString(16)
      .toUpperCase()
      .padStart(byteCount * 2, "0")
  );
};

// ! must be the same as in packages/contracts/src/interfaces/IResolver.sol
export const parsePaymentToken = (tkn: string): PaymentToken => {
  switch (tkn) {
    case "0":
      return PaymentToken.SENTINEL;
    case "1":
      return PaymentToken.WETH;
    case "2":
      return PaymentToken.DAI;
    case "3":
      // 6 decimals
      return PaymentToken.USDC;
    case "4":
      return PaymentToken.USDT;
    case "5":
      // 6 decimals
      return PaymentToken.TUSD;
    default:
      console.warn("unknown token type passed");
      return PaymentToken.DAI;
  }
};

export const timeIt = <T>(msg: string, callable: CallableFunction): T => {
  console.time(msg);
  const res: T = callable();
  console.timeEnd(msg);
  return res;
};

export const timeItAsync = async <T>(
  msg: string,
  callable: CallableFunction
): Promise<T> => {
  const start = Date.now();
  const res: T = await callable();
  const end = Date.now();
  debug(`${msg} ${end - start}ms`);
  return res;
};

export const getContractWithSigner = async (
  tokenAddress: string,
  signer: Signer,
  isERC721: boolean
): Promise<ERC721 | ERC1155> => {
  if (isERC721) {
    return getE721(tokenAddress, signer);
  } else {
    return getE1155(tokenAddress, signer);
  }
};

export const getContractWithProvider = async (
  tokenAddress: string,
  isERC721: boolean
): Promise<ERC721 | ERC1155> => {
  const provider = new JsonRpcProvider(
    process.env.NEXT_PUBLIC_PROVIDER_URL,
    "homestead"
  );
  if (isERC721) {
    return getE721(tokenAddress, provider);
  } else {
    return getE1155(tokenAddress, provider);
  }
};

export const toDataURLFromBlob = (
  blob: Blob
): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const toDataURLFromURL = (
  url: string
): Promise<string | ArrayBuffer | null> =>
  fetch(`${url}`)
    .then((response) => response.blob())
    .then((blob) => toDataURLFromBlob(blob))
    .catch(() => {
      console.warn("could not get dataURL");
      return "";
    });

/**
 * Helps advance time on test blockhain to test claimcollateral and similar
 * @param seconds
 */
export const advanceTime = async (seconds: number): Promise<void> => {
  try {
    const provider = new JsonRpcProvider("http://localhost:8545");
    await provider.send("evm_increaseTime", [seconds]);
    await provider.send("evm_mine", []);
  } catch (e) {
    Promise.reject(e);
  }
};

export const getDistinctItems = <
  T extends Record<string | number | symbol, unknown>
>(
  nfts: T[],
  property: keyof T
): T[] => {
  const set = new Set<unknown>();
  const distinctItems = nfts.reduce<T[]>((acc, item) => {
    const field = item[property];
    if (!set.has(field)) {
      set.add(field);
      acc.push(item);
    }
    return acc;
  }, []);
  return distinctItems;
};

enum EQUALITY {
  LESS = -1,
  EQUAL = 0,
  GREATER = 1,
}
export const sortNfts = (
  a: { tokenId: string; isERC721: boolean },
  b: { tokenId: string; isERC721: boolean }
): EQUALITY => {
  {
    if (a.isERC721 === b.isERC721) {
      if (a.tokenId < b.tokenId) return EQUALITY.LESS;
      if (a.tokenId > b.tokenId) return EQUALITY.GREATER;
      return EQUALITY.EQUAL;
    }
    return a.isERC721 ? EQUALITY.LESS : EQUALITY.GREATER;
  }
};

export const filterClaimed =
  (showClaimed: boolean) =>
  (l: Lending): boolean => {
    if (showClaimed) {
      return l.collateralClaimed;
    } else {
      return !l.collateralClaimed;
    }
  };

// we define degenerate NFTs as the ones that support multiple interfaces all at the same time
// for example supporting 721 and 1155 standard at the same time
// TODO: consider if it is possible to not support one or the other but still emit the event
// TODO: of the other, thus throwing the subgraphs off
// TODO: multicall for all the NFTs, rather than individual reads
export const isDegenerateNft = async (
  address: string,
  provider: Web3Provider | undefined
): Promise<boolean> => {
  if (!provider) return true;

  const abi165 = [
    "supportsInterface(bytes4 interfaceID) external view returns (bool)",
  ];
  const contract = new Contract(address, abi165, provider);
  let isDegenerate = true;

  // https://ethereum.stackexchange.com/questions/82822/obtaining-erc721-interface-ids
  try {
    const supports721 = await contract.supportsInterface("0x80ac58cd");
    const supports1155 = await contract.supportsInterface("0xd9b67a26");
    isDegenerate = supports721 && supports1155 ? true : false;
  } catch {
    true;
  }

  return isDegenerate;
};

export const isVideo = (image: string | undefined): boolean =>
  image?.endsWith("mp4") ||
  image?.endsWith("mkv") ||
  image?.endsWith("webm") ||
  image?.endsWith("mov") ||
  image?.endsWith("avi") ||
  image?.endsWith("flv") ||
  false;

export type UniqueID = string;

export const getUniqueID = (
  nftAddress: string,
  tokenId: string,
  lendingId?: string
): UniqueID => {
  return `${nftAddress}${RENFT_SUBGRAPH_ID_SEPARATOR}${tokenId}${RENFT_SUBGRAPH_ID_SEPARATOR}${
    lendingId ?? 0
  }`;
};

export function classNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(" ");
}

export const parseLending = (
  lending: LendingRaw,
  parsedRenting?: IRenting
): ILending => {
  return {
    id: lending.id,
    //TODO:eniko get rid of getAddress, seems quite unneeded
    nftAddress: getAddress(lending.nftAddress),
    tokenId: lending.tokenId,
    lentAmount: lending.lentAmount,
    lenderAddress: getAddress(lending.lenderAddress),
    maxRentDuration: Number(lending.maxRentDuration),
    dailyRentPrice: unpackPrice(lending.dailyRentPrice),
    nftPrice: unpackPrice(lending.nftPrice),
    paymentToken: parsePaymentToken(lending.paymentToken),
    collateralClaimed: Boolean(lending.collateralClaimed),
    isERC721: lending.isERC721,
    renting: parsedRenting,
  };
};

export const parseRenting = (
  renting: RentingRaw,
  parsedLending: ILendingWithoutCircularDeps
): IRenting => {
  return {
    id: renting.id,
    renterAddress: getAddress(renting.renterAddress),
    rentDuration: Number(renting.rentDuration),
    rentedAt: Number(renting.rentedAt),
    lendingId: parsedLending.id,
    lending: parsedLending,
  };
};

export const formatCollateral = (v: number): string => {
  const parts = v.toString().split(".");
  if (parts.length === 1) {
    return v.toString();
  }
  const wholePart = parts[0];
  const decimalPart = parts[1];
  return `${wholePart}.${decimalPart.substring(0, 4)}`;
};
