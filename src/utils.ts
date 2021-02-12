import { ethers } from "ethers";
import { ERC721 } from "./hardhat/typechain/ERC721";

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
    address.toLowerCase(),
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
    address.toLowerCase(),
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
