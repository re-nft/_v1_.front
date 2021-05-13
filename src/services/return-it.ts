import { ReNFT } from "../hardhat/typechain/ReNFT";
import { ContractTransaction } from "ethers";
import { Lending, Renting } from "../contexts/graph/classes";

export default async function returnIt(
  renft: ReNFT,
  nfts: Renting[]
): Promise<ContractTransaction> {
  const addresses = nfts.map((item) => item.address);
  const tokenIds = nfts.map((item) => item.tokenId);
  const lendingIds = nfts.map((item) => item.renting.lendingId);
  // TODO: will fail
  const amounts = [1];
  return await renft.returnIt(addresses, tokenIds, amounts, lendingIds);
}
