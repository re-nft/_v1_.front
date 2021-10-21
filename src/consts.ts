import { BigNumber, ethers } from "ethers";

export const SECOND_IN_MILLISECONDS = 1_000;

export const DP18 = ethers.utils.parseEther("1");
export const DP9 = BigNumber.from(1000_000_000);

export const MAX_UINT256 =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export const RENFT_SUBGRAPH_ID_SEPARATOR = "::";

export const IS_PROD = process.env["NODE_ENV"]?.toLowerCase() === "production";

export const NO_COLLECTION = "No collection";

export const ANIMETAS_CONTRACT_ADDRESS =
  "0x18df6c571f6fe9283b87f910e41dc5c8b77b7da5";
export const ANIMONKEYS_CONTRACT_ADDRESS =
  "0xa32422dfb5bf85b2084ef299992903eb93ff52b0";
export const GFC_CONTRACT_ADDRESS =
  "0x3702f4C46785BbD947d59A2516ac1ea30F2BAbF2".toLowerCase();
export const GFC_WEAPON_CONTRACT_ADDRESS =
  "0x50332CAf64c4bC316C736D3CC7965E860A056cA0".toLowerCase();
export const GFC_COMPANION_CONTRACT_ADDRESS =
  "0x373c7a6f701de2f450d27f5a89960037dd2ec9e4".toLowerCase();
