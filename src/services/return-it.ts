import { ReNFT } from "@renft/sdk";
import { ContractTransaction, Signer, BigNumber } from "ethers";
import { getReNFT } from "./get-renft-instance";

export default async function returnIt(
  signer: Signer,
  nfts: {
    address: string;
    tokenId: string;
    amount: string;
    lendingId: string;
  }[]
): Promise<ContractTransaction> {
  return await getReNFT(signer).returnIt(
    nfts.map((nft) => (nft.address)),
    nfts.map((nft) => (BigNumber.from(nft.tokenId))),
    nfts.map((nft) => (Number(nft.amount))),
    nfts.map((nft) => (BigNumber.from(nft.lendingId)))
  );
}
