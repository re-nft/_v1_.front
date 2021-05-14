import { ReNFT } from "../hardhat/typechain/ReNFT";
import { BigNumber, ContractTransaction } from "ethers";
import { Lending, Nft } from "../contexts/graph/classes";

export default async function claimCollateral(
  renft: ReNFT,
  nfts: Nft[]
): Promise<ContractTransaction> {
  const address = nfts.map((item) => item.address);
  const tokenIds = nfts.map((item) => item.tokenId);
  const lendingIds: BigNumber[] = (nfts as any[] as Lending[]).map(
    (item: Lending) => BigNumber.from(item.id)
  );
  // TODO: will fail
  const amounts = [1];
  return await renft.claimCollateral(address, tokenIds, amounts, lendingIds);
}
