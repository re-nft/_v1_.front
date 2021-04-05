import { RentNft } from "../hardhat/typechain/RentNft";
import { BigNumber, ContractTransaction } from "ethers";
import { Lending, Nft } from "../contexts/graph/classes";

export default async function stopLend(
  renft: RentNft,
  nfts: Nft[]
): Promise<ContractTransaction> {
  const address = nfts.map((item) => item.address);
  const tokenIds = nfts.map((item) => item.tokenId);
  const lendingIds: BigNumber[] = ((nfts as any[]) as Lending[]).map(
    (item: Lending) => BigNumber.from(item.id)
  );
  return await renft.stopLending(address, tokenIds, lendingIds);
}
