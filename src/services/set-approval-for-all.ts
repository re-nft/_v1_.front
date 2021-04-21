import { ReNFT } from "../hardhat/typechain/ReNFT";
import { ContractTransaction } from "ethers";
import { Nft } from "../contexts/graph/classes";

export default async function setApprovalForAll(
  renft: ReNFT,
  nfts: Nft[]
): Promise<ContractTransaction[]> {
  const distinctItems = nfts.filter(
    (item, index, all) =>
      all.findIndex((nft) => nft.address === item.address) === index
  );

  return await Promise.all(
    distinctItems.map((nft) => {
      const contract = nft.contract();
      return contract.setApprovalForAll(renft.address, true);
    })
  );
}
