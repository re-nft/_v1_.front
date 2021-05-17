import { ReNFT } from "../hardhat/typechain/ReNFT";
import { ERC721 } from "../hardhat/typechain/ERC721";
import { ERC1155 } from "../hardhat/typechain/ERC1155";

export default async function isApprovalForAll(
  renft: ReNFT,
  nft: { address: string; contract: () => ERC721 | ERC1155 }[],
  currentAddress: string
): Promise<boolean> {
  const distinctItems = nft.filter(
    (item, index, all) =>
      all.findIndex((nft) => nft.address === item.address) === index
  );

  const result = await Promise.all(
    distinctItems.map((nft) => {
      const contract = nft.contract();
      return contract.isApprovedForAll(currentAddress, renft.address);
    })
  );

  return result.every((isApproved) => isApproved);
}
