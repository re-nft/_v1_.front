import { RentNft } from "../hardhat/typechain/RentNft";
import { BigNumber, ContractTransaction } from "ethers";
import { PaymentToken } from "../types";
import { Nft } from "../contexts/graph/classes";
import { decimalToPaddedHexString } from "../utils";

export default async function startLend(
  renft: RentNft,
  nft: Nft,
  maxDuration: string,
  borrowPrice: string,
  nftPrice: string,
  pmtToken: PaymentToken
): Promise<ContractTransaction> {
  const result = await renft.lend(
    [nft.address ?? ""],
    [nft.tokenId ?? ""],
    [BigNumber.from(maxDuration)],
    [decimalToPaddedHexString(Number(borrowPrice), 32)],
    [decimalToPaddedHexString(Number(nftPrice), 32)],
    [pmtToken.toString()]
  );

  return result;
}
