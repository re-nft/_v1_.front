import { ethers, providers } from "ethers";
import { ERC721 } from "./types/typechain/ERC721";
import { ERC1155 } from "./types/typechain/ERC1155";
import { ERC20 } from "./types/typechain/ERC20";
import fetch from "cross-fetch";
import createDebugger from "debug";
import moment from "moment";
import { Lending, Nft, NftType, Renting } from "./contexts/graph/classes";
//@ts-ignore
import { PaymentToken } from "@eenagy/sdk";
import { JsonRpcProvider } from "@ethersproject/providers";
import { ERC1155__factory } from "./contracts/ERC1155__factory";
import { ERC721__factory } from "./contracts/ERC721__factory";
import { diffJson } from "diff";
import {
  RENFT_SUBGRAPH_ID_SEPARATOR,
  ANIMETAS_CONTRACT_ADDRESS,
  ANIMONKEYS_CONTRACT_ADDRESS,
  GFC_CONTRACT_ADDRESS,
  GFC_WEAPON_CONTRACT_ADDRESS,
  GFC_COMPANION_CONTRACT_ADDRESS,
} from "./consts";
import { IRenting } from "./contexts/graph/types";

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

export const getE20 = (address: string, signer?: ethers.Signer): ERC20 => {
  const erc20Contract = new ethers.Contract(
    ethers.utils.getAddress(address),
    e20abi,
    signer
  ) as ERC20;
  return erc20Contract;
};

export const getE721 = (
  address: string,
  signer: ethers.Signer | JsonRpcProvider
): ERC721 => {
  const erc721Contract = ERC721__factory.connect(address, signer);
  return erc721Contract;
};

export const getE1155 = (
  address: string,
  signer: ethers.Signer | JsonRpcProvider
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
  signer: ethers.Signer,
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
 * Helps advance time on test blockhain to test claimColletaral and similar
 * @param seconds
 */
export const advanceTime = async (seconds: number): Promise<void> => {
  try {
    const provider = new providers.JsonRpcProvider("http://localhost:8545");
    await provider.send("evm_increaseTime", [seconds]);
    await provider.send("evm_mine", []);
  } catch (e) {
    Promise.reject(e);
  }
};

export const getDistinctItems = <T extends Object>(
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

export const nftReturnIsExpired = (renting: IRenting): boolean => {
  const isExpired =
    moment(renting.rentedAt * 1000)
      .add(renting.rentDuration, "days")
      .unix() *
      1000 <
    moment.now();
  return isExpired;
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
  (showClaimed: boolean) => (l: Lending | Renting) => {
    if (!showClaimed) {
      if (l.lending) return !l.lending.rentClaimed;
      return false;
    }
    return true;
  };
export const mapAddRelendedField =
  (ids: Set<string>) => (l: Lending | Renting) => {
    return {
      ...l,
      relended: ids.has(`${l.nftAddress}:${l.tokenId}`),
    };
  };
export const mapToIds = (items: Renting[] | Lending[]) => {
  return new Set(
    items.map((r: Renting | Lending) => `${r.nftAddress}:${r.tokenId}`)
  );
};

// we define degenerate NFTs as the ones that support multiple interfaces all at the same time
// for example supporting 721 and 1155 standard at the same time
// TODO: consider if it is possible to not support one or the other but still emit the event
// TODO: of the other, thus throwing the subgraphs off
// TODO: multicall for all the NFTs, rather than individual reads
export const isDegenerateNft = async (
  address: string,
  provider: ethers.providers.Web3Provider | undefined
): Promise<boolean> => {
  if (!provider) return true;

  const abi165 = [
    "supportsInterface(bytes4 interfaceID) external view returns (bool)",
  ];
  const contract = new ethers.Contract(address, abi165, provider);
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

export const isVideo = (image: string | undefined) =>
  image?.endsWith("mp4") ||
  image?.endsWith("mkv") ||
  image?.endsWith("webm") ||
  image?.endsWith("mov") ||
  image?.endsWith("avi") ||
  image?.endsWith("flv");

export const hasDifference = (
  a: Record<string, unknown> | unknown[],
  b: Record<string, unknown> | unknown[]
) => {
  const difference = diffJson(a, b, {
    ignoreWhitespace: true,
  });
  //const difference = true;
  if (
    difference &&
    difference[1] &&
    (difference[1].added || difference[1].removed)
  ) {
    return true;
  }
  return false;
};
export type UniqueID = string;

// typeguard for Lending class
export const isLending = (x: Nft | Lending | Renting): x is Lending => {
  return x.type === NftType.Lending;
};

export const isRenting = (x: Nft | Lending | Renting): x is Renting => {
  return x.type === NftType.Renting;
};

export const isNft = (x: Nft | Lending | Renting): x is Nft => {
  return x.type === NftType.Nft;
};
export const getUniqueID = (
  nftAddress: string,
  tokenId: string,
  lendingId?: string
): UniqueID => {
  return `${nftAddress}${RENFT_SUBGRAPH_ID_SEPARATOR}${tokenId}${RENFT_SUBGRAPH_ID_SEPARATOR}${
    lendingId ?? 0
  }`;
};

// const getLendingId = (item: Nft): string => {
//   let lendingID = "0";
//   if (isLending(item)) lendingID = item.lending.id;
//   else if (isRenting(item))
//     lendingID = item.renting.lendingId
//       .concat(RENFT_SUBGRAPH_ID_SEPARATOR)
//       .concat("renting");
//   return lendingID;
// };
// export const getUniqueCheckboxId = (item: Nft): string => {
//   return getUniqueID(item.address, item.tokenId, getLendingId(item));
// };

export const filterByCompany = (): ((v) => boolean) => {
  if (process.env.NEXT_PUBLIC_NETWORK_SUPPORTED !== "mainnet") {
    return () => true;
  } else if (process.env.NEXT_PUBLIC_FILTER_COMPANY === "animetas") {
    return (v) =>
      v.nftAddress.toLowerCase() === ANIMETAS_CONTRACT_ADDRESS ||
      v.nftAddress.toLowerCase() === ANIMONKEYS_CONTRACT_ADDRESS;
  } else if (process.env.NEXT_PUBLIC_FILTER_COMPANY === "gfc") {
    return (v) => {
      return (
        v.nftAddress.toLowerCase() === GFC_CONTRACT_ADDRESS ||
        v.nftAddress.toLowerCase() === GFC_WEAPON_CONTRACT_ADDRESS ||
        v.nftAddress.toLowerCase() === GFC_COMPANION_CONTRACT_ADDRESS
      );
    };
  } else if (typeof process.env.NEXT_PUBLIC_FILTER_COMPANY !== "undefined") {
    throw new Error("No support for this company.");
  }
  return () => true;
};
