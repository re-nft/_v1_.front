import { ethers, providers } from "ethers";
import { ERC721 } from "./types/typechain/ERC721";
import { ERC1155 } from "./types/typechain/ERC1155";
import { ERC20 } from "./types/typechain/ERC20";
import fetch from "cross-fetch";
import createDebugger from "debug";
import moment from "moment";
import { Lending, Renting } from "./contexts/graph/classes";
import { PaymentToken } from "@renft/sdk";
import { JsonRpcProvider } from "@ethersproject/providers";

// ENABLE with DEBUG=* or DEBUG=FETCH,Whatever,ThirdOption
const debug = createDebugger("app:timer");

const PRICE_BITSIZE = 32;

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
  "event Transfer(address indexed from, address indexed to, uint amount)"
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
  "function tokenURI(uint256 tokenId) external view returns (string address)"
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
  "function safeBatchTransferFrom(address from, address to, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data) external"
];

export const getE20 = (address: string, signer?: ethers.Signer): ERC20 => {
  const erc20Contract = new ethers.Contract(
    ethers.utils.getAddress(address),
    e20abi,
    signer
  ) as ERC20;
  return erc20Contract;
};

export const getE721 = (address: string, signer?: ethers.Signer | JsonRpcProvider): ERC721 => {
  const erc721Contract = new ethers.Contract(
    ethers.utils.getAddress(address),
    e721abi,
    signer
  ) as ERC721;
  return erc721Contract;
};

export const getE1155 = (address: string, signer?: ethers.Signer | JsonRpcProvider): ERC1155 => {
  const erc1155Contract = new ethers.Contract(
    ethers.utils.getAddress(address),
    e1155abi,
    signer
  ) as ERC1155;
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
  signer: ethers.Signer
): Promise<ERC721 | ERC1155> => {
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
  return contract;
};

export const getContractWithProvider = async (
  tokenAddress: string,
): Promise<ERC721 | ERC1155> => {
  let contract: ERC721 | ERC1155;
  let isERC721 = false;
  const provider = new JsonRpcProvider(process.env.REACT_APP_PROVIDER_URL)
  // todo: don't think this will actually work
  // todo: need that schema from github
  try {
    contract = getE721(tokenAddress, provider);
    isERC721 = true;
  } catch {
    contract = getE1155(tokenAddress, provider);
  }
  return contract;
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
  GREATER = 1
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
      if (l.lending) return !l.lending.collateralClaimed;
      return false;
    }
    return true;
  };
export const mapAddRelendedField =
  (ids: Set<string>) => (l: Lending | Renting) => {
    return {
      ...l,
      relended: ids.has(`${l.nftAddress}:${l.tokenId}`)
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
    "supportsInterface(bytes4 interfaceID) external view returns (bool)"
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

