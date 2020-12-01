import { AbiItem } from "web3-utils";
import { Address } from "../types";

export type NetworkSpecificAbis = {
  face: AbiItem;
  rent: AbiItem;
  faucet: AbiItem;
  resolver: AbiItem;
};

export type NetworkSpecificAddresses = {
  face: Address;
  rent: Address;
  resolver: Address;
  faucet: Address;
};
