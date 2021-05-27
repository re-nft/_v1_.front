import { ERC721 } from "../hardhat/typechain/ERC721";
import { ERC1155 } from "../hardhat/typechain/ERC1155";
import { ContractTransaction } from "ethers";
import { CONTRACT_ADDRESS } from "../consts";

export default async function setApprovalForAll(
  nfts: { address: string; contract: () => ERC721 | ERC1155 }[]
): Promise<ContractTransaction[]> {
  if (!CONTRACT_ADDRESS)
    throw new Error(
      `Please specify contract address for ${process.env.REACT_APP_ENVIRONMENT}`
    );
  const distinctItems = nfts.filter(
    (item, index, all) =>
      all.findIndex((nft) => nft.address === item.address) === index
  );

  return await Promise.all(
    distinctItems.map((nft) => {
      const contract = nft.contract();
      return contract.setApprovalForAll(CONTRACT_ADDRESS as string, true);
    })
  );
}
