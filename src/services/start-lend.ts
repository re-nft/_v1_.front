import { ReNFT } from "../hardhat/typechain/ReNFT";
import { BigNumber, ContractTransaction } from "ethers";
import { PaymentToken } from "../types";
import { Nft } from "../contexts/graph/classes";
import { packPrice } from "../utils";

export default async function startLend(
  renft: ReNFT,
  nfts: Nft[],
  lendAmounts: string[],
  maxDurations: string[],
  dailyPrices: string[],
  nftPrices: string[],
  tokens: PaymentToken[]
): Promise<ContractTransaction | undefined> {
  const addresses: string[] = [];
  const tokenIds: string[] = [];
  const amounts: string[] = [];
  const maxRentDurations: BigNumber[] = [];
  const dailyRentPrices: string[] = [];
  const collaterals: string[] = [];
  const pmtTokens: string[] = [];

  try {
    for (let i = 0; i < maxDurations.length; i++) {
      addresses.push(nfts[i].address);
      tokenIds.push(nfts[i].tokenId);
      amounts.push(lendAmounts[i]);
      maxRentDurations.push(BigNumber.from(maxDurations[i]));
      dailyRentPrices.push(packPrice(Number(dailyPrices[i])));
      collaterals.push(packPrice(Number(nftPrices[i])));
      pmtTokens.push(tokens[i].toString());
    }
  } catch (e) {
    console.warn("varying length inputs. you must have missed a token");
    return;
  }
  const aaa: Promise<ContractTransaction | undefined> = new Promise((resolve, reject) => {
    renft.lend(
      addresses,
      tokenIds,
      amounts,
      maxRentDurations,
      dailyRentPrices,
      collaterals,
      pmtTokens
    ).then(v => resolve(v)).catch((e) =>{
      console.log(e)
      resolve(undefined)
    });
  });

  return await aaa;
}
