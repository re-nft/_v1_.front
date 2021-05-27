import { Signer } from "ethers";
import { ReNFT } from "@renft/sdk";
import { CONTRACT_ADDRESS } from "../consts";

export const getReNFT = (signer: Signer): ReNFT => {
  if (!CONTRACT_ADDRESS)
    throw new Error(
      `Please specify contract address for ${process.env.REACT_APP_ENVIRONMENT}`
    );
  return new ReNFT(signer, CONTRACT_ADDRESS);
};
