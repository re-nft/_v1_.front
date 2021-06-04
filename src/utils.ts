import { ethers, BigNumber, BigNumberish, providers } from "ethers";
import { ERC721 } from "./hardhat/typechain/ERC721";
import { ERC1155 } from "./hardhat/typechain/ERC1155";
import { ERC20 } from "./hardhat/typechain/ERC20";
import { PaymentToken } from "./types";
import fetch from "cross-fetch";
import createDebugger from "debug";

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

//TODO:eniko do we need this
export const unpackPrice = (price: BigNumberish, scale: BigNumber, divide: number): number => {
  // price is from 1 to 4294967295. i.e. from 0x00000001 to 0xffffffff
  const numHex = decimalToPaddedHexString(Number(price), PRICE_BITSIZE).slice(
    2
  );
  let whole = parseInt(numHex.slice(0, 4), 16);
  let decimal = parseInt(numHex.slice(4), 16);
  if (whole > 9999) whole = 9999;
  if (decimal > 9999) decimal = 9999;
  const w = BigNumber.from(whole).mul(scale);
  const d = BigNumber.from(decimal).mul(scale.div(10_000));
  const _price = w.add(d);
  // * think of a neat way to divide by 1e18
  return Number(_price) / divide;
};

export const packPrice = (price: number): string => {
  if (price > 9999.9999) throw new Error("too high");
  if (price < 0.0001) throw new Error("too low");
  const stringVersion = price.toString();
  const parts = stringVersion.split(".");
  let res: string;
  if (parts.length == 2) {
    const whole = parts[0];
    let decimal = parts[1];
    while (decimal.length < 4) {
      decimal += "0";
    }
    const wholeHex = decimalToPaddedHexString(Number(whole), 16);
    const decimalHex = decimalToPaddedHexString(Number(decimal), 16);
    const hexRepr = wholeHex.concat(decimalHex.slice(2));
    res = hexRepr;
  } else {
    if (parts.length != 1) throw new Error("price packing issue");
    const whole = parts[0];
    const wholeHex = decimalToPaddedHexString(Number(whole), 16);
    const decimalHex = "0000";
    res = wholeHex.concat(decimalHex);
  }
  return res;
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
