import { ReNFT } from "../hardhat/typechain/ReNFT";
import { ContractTransaction } from "ethers";

export default async function stopLend(
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
  const lendingIds: string[] = [];
  const amounts: string[] = [];

  for (const nft of nfts) {
    addresses.push(nft.address);
    tokenIds.push(nft.tokenId);
    lendingIds.push(nft.lendingId);
    amounts.push(nft.amount);
  }

  return await renft.stopLending(addresses, tokenIds, amounts, lendingIds);
}
