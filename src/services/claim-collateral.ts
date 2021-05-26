import { BigNumber, ContractTransaction, Signer } from "ethers";
import { getReNFT } from "./get-renft-instance";

/**
 * claim collateral can be successfully invoked when the renting is past the due date.
 * To claim collateral, a lending id must be passed
 * @param renft
 * @param nfts
 * @returns
 */
export default async function claimCollateral(
  signer: Signer,
  nfts: { address: string; tokenId: string; lendingId: string; lendingAmount: string }[]
): Promise<ContractTransaction> {
  return await getReNFT(signer).claimCollateral(
    nfts.map((nft) => (nft.address)),
    nfts.map((nft) => (BigNumber.from(nft.tokenId))),
    nfts.map((nft) => (Number(nft.lendingAmount))),
    nfts.map((nft) => (BigNumber.from(nft.lendingId)))
  );
}
