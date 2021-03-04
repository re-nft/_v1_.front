import { RentNft } from "../hardhat/typechain/RentNft";
import { ContractTransaction } from "ethers";
import { Nft } from "../contexts/graph/classes";

export default async function returnIt(
  renft: RentNft,
  nft: Nft,
): Promise<ContractTransaction> {
  const result = await renft.returnIt(
    [nft.address ?? ""],
    [nft.tokenId ?? ""],
    //@ts-ignore
    [nft.lending?.[0]]
  );

  return result;
}
