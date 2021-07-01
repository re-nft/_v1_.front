import { ethers, BigNumberish, providers } from "ethers";
import { ERC721 } from "./hardhat/typechain/ERC721";
import { ERC1155 } from "./hardhat/typechain/ERC1155";
import { ERC20 } from "./hardhat/typechain/ERC20";
import { PaymentToken } from "./types";
import fetch from "cross-fetch";
import createDebugger from "debug";
import moment from "moment";
import { Renting } from "./contexts/graph/classes";

// ENABLE with DEBUG=* or DEBUG=FETCH,Whatever,ThirdOption
const debug = createDebugger("app:timer");

const PRICE_BITSIZE = 32;

export const short = (s: string): string =>
  `${s.substr(0, 7)}...${s.substr(s.length - 7, 7)}`;

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

const e721abi = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
  "function balanceOf(address owner) external view returns (uint256 balance)",
  "function ownerOf(uint256 tokenId) external view returns (address owner)",
  "function safeTransferFrom(address from, address to, uint256 tokenId) external",
  "function transferFrom(address from, address to, uint256 tokenId) external",
  "function approve(address to, uint256 tokenId) external",
  "function getApproved(uint256 tokenId) external view returns (address operator)",
  "function setApprovalForAll(address operator, bool _approved) external",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  "function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external",
  "function tokenURI(uint256 tokenId) external view returns (string address)",
];

const e1155abi = [
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)",
  "event ApprovalForAll(address indexed account, address indexed operator, bool approved)",
  "event URI(string value, uint256 indexed id)",
  "function balanceOf(address account, uint256 id) external view returns (uint256)",
  "function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) external view returns (uint256[] memory)",
  "function setApprovalForAll(address operator, bool approved) external",
  "function isApprovedForAll(address account, address operator) external view returns (bool)",
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external",
  "function safeBatchTransferFrom(address from, address to, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data) external",
];

export const getE20 = (address: string, signer?: ethers.Signer): ERC20 => {
  const erc20Contract = new ethers.Contract(
    ethers.utils.getAddress(address),
    e20abi,
    signer
  ) as ERC20;
  return erc20Contract;
};

export const getE721 = (address: string, signer?: ethers.Signer): ERC721 => {
  const erc721Contract = new ethers.Contract(
    ethers.utils.getAddress(address),
    e721abi,
    signer
  ) as ERC721;
  return erc721Contract;
};

export const getE1155 = (address: string, signer?: ethers.Signer): ERC1155 => {
  const erc1155Contract = new ethers.Contract(
    ethers.utils.getAddress(address),
    e1155abi,
    signer
  ) as ERC1155;
  return erc1155Contract;
};

export const fetchNftApprovedERC721 = async (
  address: string,
  tokenId: number,
  signer?: ethers.Signer
): Promise<string> => {
  const erc721Contract = new ethers.Contract(
    address.toLowerCase(),
    e721abi,
    signer
  ) as ERC721;
  const approved = await erc721Contract.getApproved(tokenId);
  return approved;
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

const trimZeroEnd = (number: string): string | undefined => {
  const length = number.length;
  if (length === 0) return undefined;
  if (number.endsWith("0")) {
    const str = number.slice(0, length - 1);
    return trimZeroEnd(str);
  }
  return number;
};

/**
 *
 * @param number
 * @returns Number with cut to 4 digits after whole part, also removes trailing 0s
 */
export const normalizeFloat = (number: number | string): number => {
  const str = number.toString();
  if (str.indexOf(".") > 0) {
    const [a, b] = str.split(".");
    const trimmedDecimal = trimZeroEnd(b);
    if (trimmedDecimal) {
      return Number(`${a}.${b}`);
    }
    return Number(a);
  }
  return Number(number);
};

export const normalizeFloatTo4Decimals = (number: number | string): number => {
  const str = number.toString();
  if (str.indexOf(".") > 0) {
    const [a, b] = str.split(".");
    const number = Number(`${a}.${b.slice(0, 4)}`);
    return normalizeFloat(number)
  }
  return Number(str);
};

export const unpackPrice = (price: BigNumberish): number => {
  // price is from 1 to 4294967295. i.e. from 0x00000001 to 0xffffffff
  const numHex = decimalToPaddedHexString(Number(price), PRICE_BITSIZE).slice(
    2
  );
  let whole = parseInt(numHex.slice(0, 4), 16);
  let decimal = parseInt(numHex.slice(4), 16);
  if (whole > 9999) whole = 9999;
  if (decimal > 9999) decimal = 9999;
  const number = parseFloat(`${whole}.${decimal}`);
  return normalizeFloatTo4Decimals(number);
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

export const getContract = async (
  tokenAddress: string,
  signer: ethers.Signer
): Promise<{ contract: ERC721 | ERC1155; isERC721: boolean }> => {
  let contract: ERC721 | ERC1155;
  let isERC721 = false;
  // todo: don't think this will actually work
  // todo: need that schema from github
  try {
    contract = getE721(tokenAddress, signer);
    isERC721 = true;
  } catch {
    contract = getE1155(tokenAddress, signer);
  }
  return { contract, isERC721 };
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
 * ReNFT is implemented in such a way that it invokes handlers (lent, rend, stopLend, claim, return)
 * on unique groups of NFTs. For example, 721A,1155A,1155A,1155B will invoke the handler 3 times.
 * Once for 721A, once for 1155A,1155A and once for 1155B. This means, that we must bundle the NFTs
 * correctly on the front-end to be passed to the contracts. That means that same addresses must
 * be next to each other, and the respective tokenIds (in the case of 1155s) must be ordered in ascending
 * order
 */
const bundleNfts = () => {
  true;
};

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

export const nftReturnIsExpired = (rent: Renting): boolean => {
  const isExpired =
    moment(rent.renting.rentedAt * 1000)
      .add(rent.renting.rentDuration, "days")
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
