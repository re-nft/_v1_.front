import { ethers } from "ethers";

export const SECOND_IN_MILLISECONDS = 1_000;

export const DP18 = ethers.utils.parseEther("1");

export const MAX_UINT256 =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export const RENFT_SUBGRAPH_ID_SEPARATOR = "::";

// TODO: in prod, change this URI for security and save in env variables
export const CORS_PROXY =
  "https://us-central1-renft-front-cors-proxy.cloudfunctions.net/cors?url=";
