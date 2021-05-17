import { ReNFT } from "../hardhat/typechain/ReNFT";
import { BigNumber, ContractTransaction } from "ethers";
import { Renting } from "../contexts/graph/classes";

/**
 * claim collateral can be successfully invoked when the renting is past the due date.
 * To claim collateral, a lending id must be passed
 * @param renft
 * @param nfts
 * @returns
 */
export default async function claimCollateral(
  renft: ReNFT,
  nfts: { address: string; tokenId: string; lendingId: string }[]
): Promise<ContractTransaction> {
  // same 1155s need to be gathered together, and their tokenIds must be sorted in ascending order

  // for (let nft of nfts)

  // const address = nfts.map((item) => item.address);
  // const tokenIds = nfts.map((item) => item.tokenId);
  // const lendingIds: BigNumber[] = nfts.map(
  //   (item: Lending) => BigNumber.from(item.id)
  // );
  // TODO: will fail
  const amounts = [1];
  return await renft.claimCollateral(
    [nfts[0].address],
    [nfts[0].tokenId],
    amounts,
    [nfts[0].lendingId]
  );
}
