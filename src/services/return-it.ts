import { ReNFT } from "@renft/sdk";
import { ContractTransaction, Signer, BigNumber } from "ethers";

export default async function returnIt(
  signer: Signer,
  nfts: {
    address: string;
    tokenId: string;
    amount: string;
    lendingId: string;
  }[]
): Promise<ContractTransaction> {
  const addresses: string[] = [];
  const tokenIds: BigNumber[] = [];
  const amounts: number[] = [];
  const lendingIds: BigNumber[] = [];

  for (const nft of nfts) {
    addresses.push(nft.address);
    tokenIds.push(BigNumber.from(nft.tokenId));
    amounts.push(Number(nft.amount));
    lendingIds.push(BigNumber.from(nft.lendingId));
  }

  const renft = new ReNFT(signer);

  return await renft.returnIt(addresses, tokenIds, amounts, lendingIds);
}
