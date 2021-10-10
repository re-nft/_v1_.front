import { parseEther } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";

export const SECOND_IN_MILLISECONDS = 1_000;

export const DP18 = parseEther("1");
export const DP9 = BigNumber.from(1000_000_000);

export const MAX_UINT256 =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export const RENFT_SUBGRAPH_ID_SEPARATOR = "::";

export const IS_PROD = process.env["NODE_ENV"]?.toLowerCase() === "production";

export const NO_COLLECTION = "No collection";

export const NUMBER_REGEX =
  /^([1-9][0-9]{0,3}(\.[0-9])?)|([0-9]{1,4}\.(([0-9]{3}[1-9])|([1-9][0-9]{3})|([0-9][1-9][0-9]{2})|([0-9]{2}[1-9][0-9])))$/;
