import {Signer} from "ethers";
import {ReNFT} from "@renft/sdk"

export const getReNFT = (signer: Signer): ReNFT => {
  return new ReNFT(signer, "0x610178dA211FEF7D417bC0e6FeD39F05609AD788");
}
