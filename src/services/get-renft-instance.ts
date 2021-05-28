import { Signer } from "ethers";
import { ReNFT } from "@renft/sdk";

export const getReNFT = (signer: Signer, address: string): ReNFT => {
  if(!address) throw new Error('You have empty contract address')
  return new ReNFT(signer, address);
};
