import { RentNft } from "../hardhat/typechain/RentNft";
import { ContractTransaction } from "ethers";
import { Nft } from "../contexts/graph/classes";

export default async function setApprovalForAll(
  renft: RentNft,
  nfts: Nft[]
): Promise<ContractTransaction[]> {
  const distinctItems = nfts.filter(
    (item, index, all) =>
      all.findIndex((nft) => nft.address === item.address) === index
  );
  const result = await Promise.all(
    distinctItems.map((nft) => {
      const contract = nft.contract();
      return contract.setApprovalForAll(renft.address, true);
    })
  );

  return result;
}
