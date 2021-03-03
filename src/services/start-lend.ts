import { RentNft } from "../hardhat/typechain/RentNft";
import { BigNumber, ContractTransaction } from "ethers";
import { PaymentToken } from "../types";
import { ERCNft } from "../contexts/Graph/types";
import { decimalToPaddedHexString } from "../utils";

type NFT = {
  contract?: ERCNft["contract"];
  tokenId?: ERCNft["tokenId"];
};

export default async function startLend(
  renft: RentNft, 
  nft: NFT, 
  maxDuration: string, 
  borrowPrice: string, 
  nftPrice: string, 
  pmtToken: PaymentToken
  ): Promise<ContractTransaction> {
    const result = await renft.lend(
      [nft.contract?.address ?? ""],
      [nft.tokenId ?? ""],
      [BigNumber.from(maxDuration)],
      [decimalToPaddedHexString(Number(borrowPrice), 32)],
      [decimalToPaddedHexString(Number(nftPrice), 32)],
      [pmtToken.toString()]
    );

    return result;
}
