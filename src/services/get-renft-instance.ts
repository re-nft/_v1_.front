import {Signer} from "ethers";
import {ReNFT} from "@renft/sdk"

export const getReNFT = (signer: Signer): ReNFT => {
  return new ReNFT(signer, "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e");
}
