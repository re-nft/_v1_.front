import { RentNft } from "../hardhat/typechain/RentNft";
import { BigNumber, ContractTransaction } from "ethers";
import { PaymentToken } from "../types";
import { Nft } from "../contexts/graph/classes";
import { decimalToPaddedHexString } from "../utils";

export default async function startLend(
  renft: RentNft,
  nfts: Nft[],
  maxDurations: string[],
  borrowPrices: string[],
  nftPrices: string[],
  pmtTokens: PaymentToken[]
): Promise<ContractTransaction> {
  const address = nfts.map(nft => nft.address);
  const tokenIds = nfts.map(nft => nft.tokenId);
  const durations = maxDurations.map(item => BigNumber.from(item));
  const bPrices = borrowPrices.map(item => decimalToPaddedHexString(Number(item), 32));
  const nPrices = nftPrices.map(item => decimalToPaddedHexString(Number(item), 32));
  const _pmtTokens = pmtTokens.map(item => item.toString());
  const result = await renft.lend(
    address,
    tokenIds,
    durations,
    bPrices,
    nPrices,
    _pmtTokens
  );

  return result;
}
