import { ethers, BigNumber, BigNumberish } from "ethers";
import { ERC721 } from "./hardhat/typechain/ERC721";
import { PaymentToken } from "./types";

const PRICE_BITSIZE = 32;

export const short = (s: string): string =>
  `${s.substr(0, 5)}...${s.substr(s.length - 5, 5)}`;

export const THROWS = (): void => {
  throw new Error("must be implemented");
};

export const ASYNC_THROWS = async (): Promise<void> => {
  throw new Error("must be implemented");
};

export const getRandomInt = (max: number): number => {
  return Math.floor(Math.random() * Math.floor(max));
};

const erc721abi = [
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

const erc1155abi = [
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

export const getERC721 = (address: string, signer?: ethers.Signer): ERC721 => {
  const erc721Contract = new ethers.Contract(
    ethers.utils.getAddress(address),
    erc721abi,
    signer
  ) as ERC721;
  return erc721Contract;
};

export const getERC1155 = (
  address: string,
  signer?: ethers.Signer
): ethers.Contract => {
  const erc1155Contract = new ethers.Contract(
    ethers.utils.getAddress(address),
    erc1155abi,
    signer
  );
  return erc1155Contract;
};

export const fetchNftApprovedERC721 = async (
  address: string,
  tokenId: number,
  signer?: ethers.Signer
): Promise<string> => {
  const erc721Contract = new ethers.Contract(
    address.toLowerCase(),
    erc721abi,
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

export const unpackPrice = (
  price: BigNumberish,
  scale: BigNumber
): BigNumber => {
  const numHex = decimalToPaddedHexString(Number(price), PRICE_BITSIZE).slice(
    2
  );
  return unpackHexPrice(numHex, scale);
};

export const unpackHexPrice = (price: string, scale: BigNumber): BigNumber => {
  const resolvedPrice: string = price;
  if (price.startsWith("0x")) {
    resolvedPrice.slice(2);
  }
  let whole = parseInt(resolvedPrice.slice(0, 4), 16);
  let decimal = parseInt(resolvedPrice.slice(4), 16);
  if (whole > 9999) whole = 9999;
  if (decimal > 9999) decimal = 9999;
  const w = BigNumber.from(whole).mul(scale);
  const d = BigNumber.from(decimal).mul(scale.div(10_000));
  const _price = w.add(d);
  return _price;
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

export const parsePaymentToken = (tkn: string): PaymentToken => {
  switch (tkn) {
    case "0":
      return PaymentToken.DAI;
    case "1":
      return PaymentToken.USDC;
    case "2":
      return PaymentToken.USDT;
    case "3":
      return PaymentToken.TUSD;
    case "4":
      return PaymentToken.RENT;
    default:
      return PaymentToken.RENT;
  }
};
