import { ethers } from "ethers";
import { RENFT_ADDRESS } from "@renft/sdk";

export const SECOND_IN_MILLISECONDS = 1_000;

export const DP18 = ethers.utils.parseEther("1");

export const MAX_UINT256 =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export const RENFT_SUBGRAPH_ID_SEPARATOR = "::";

export const IS_PROD =
  process.env["REACT_APP_ENVIRONMENT"]?.toLowerCase() === "production";

export const CONTRACT_ADDRESS = IS_PROD
  ? RENFT_ADDRESS
  : process.env.REACT_APP_CONTRACT_ADDRESS;
