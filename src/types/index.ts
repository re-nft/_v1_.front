export type Optional<T> = undefined | T;
export type Address = string;
export type TransactionHash = string;
export type TokenId = string;
export type URI = string;

// ! this must be the same as in packages/contracts/Resolver.sol
// export enum PaymentToken {
//   SENTINEL, // 0
//   WETH, // 1
//   DAI, // 2
//   USDC, // 3
//   USDT, // 4
//   TUSD, // 5
// }

export enum TransactionStateEnum {
  FAILED = 0,
  SUCCESS = 1,
  PENDING = 2
}

export enum NetworkName {
  mainnet = "mainnet", // this is called homestead
  ropsten = "ropsten",
  localhost = "localhost",
}

export type Path = string[];
