import { ReNFT } from "../hardhat/typechain/ReNFT";
import { BigNumber, ContractTransaction } from "ethers";
import { PaymentToken } from "../types";
import { Nft } from "../contexts/graph/classes";
import { decimalToPaddedHexString } from "../utils";

export default async function startLend(
  renft: ReNFT,
  nfts: Nft[],
  maxDurations: string[],
  dailyPrices: string[],
  nftPrices: string[],
  tokens: PaymentToken[]
): Promise<ContractTransaction | undefined> {
  const addresses: string[] = [];
  const tokenIds: string[] = [];
  const maxRentDurations: BigNumber[] = [];
  const dailyRentPrices: string[] = [];
  const collaterals: string[] = [];
  const pmtTokens: string[] = [];

  try {
    for (let i = 0; i < maxDurations.length; i++) {
      addresses.push(nfts[i].address);
      tokenIds.push(nfts[i].tokenId);
      maxRentDurations.push(BigNumber.from(maxDurations[i]));
      dailyRentPrices.push(
        decimalToPaddedHexString(Number(dailyPrices[i]), 32)
      );
      collaterals.push(decimalToPaddedHexString(Number(nftPrices[i]), 32));
      pmtTokens.push(tokens[i].toString());
    }
  } catch (e) {
    console.warn("varying length inputs. you must have missed a token");
    return;
  }

  return await renft.lend(
    addresses,
    tokenIds,
    maxRentDurations,
    dailyRentPrices,
    collaterals,
    pmtTokens
  );
}
