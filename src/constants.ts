import BN from "bn.js";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ZERO_BYTES32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
export const MAX_UINT256 = new BN("2").pow(new BN("256")).sub(new BN("1"));
export const MAX_INT256 = new BN("2").pow(new BN("255")).sub(new BN("1"));
export const MIN_INT256 = new BN("2").pow(new BN("255")).mul(new BN("-1"));
