import { RentNft } from "../hardhat/typechain/RentNft";
import { ContractTransaction } from "ethers";
import { Lending } from "../contexts/graph/classes";

export default async function returnIt(
  renft: RentNft,
  nfts: Lending[],
): Promise<ContractTransaction> {
  const addresses = nfts.map(item => item.address);
  const tokenIds = nfts.map(item => item.tokenId);
  const lendingIds = nfts.map(item => item.lending.id);

  const result = await renft.returnIt(addresses, tokenIds, lendingIds);
  return result;
}
