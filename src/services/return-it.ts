import { ReNFT } from "../hardhat/typechain/ReNFT";
import { ContractTransaction } from "ethers";

export default async function returnIt(
  renft: ReNFT,
  nfts: {
    address: string;
    tokenId: string;
    amount: string;
    lendingId: string;
  }[]
): Promise<ContractTransaction> {
  const addresses: string[] = [];
  const tokenIds: string[] = [];
  const amounts: string[] = [];
  const lendingIds: string[] = [];

  for (const nft of nfts) {
    addresses.push(nft.address);
    tokenIds.push(nft.tokenId);
    amounts.push(nft.amount);
    lendingIds.push(nft.lendingId);
  }

  return await renft.returnIt(addresses, tokenIds, amounts, lendingIds);
}
