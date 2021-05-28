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
  address: string,
  nfts: {
    address: string;
    tokenId: string;
    lendingId: string;
    amount: string;
  }[]
): Promise<ContractTransaction> {
  return await getReNFT(signer, address).claimCollateral(
    nfts.map((nft) => nft.address),
    nfts.map((nft) => BigNumber.from(nft.tokenId)),
    nfts.map((nft) => Number(nft.amount)),
    nfts.map((nft) => BigNumber.from(nft.lendingId))
  );
}
