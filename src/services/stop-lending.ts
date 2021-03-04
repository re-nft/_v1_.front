import { RentNft } from "../hardhat/typechain/RentNft";
import { BigNumber, ContractTransaction } from "ethers";
import { Nft } from "../contexts/graph/classes";

export default async function stopLend(renft: RentNft, nft: Nft,lendingId: string): Promise<ContractTransaction> {
  const result = await renft.stopLending(
    [nft.address ?? ""],
    [nft.tokenId ?? ""],
    [BigNumber.from(lendingId)]
  );
  
  return result;
}
