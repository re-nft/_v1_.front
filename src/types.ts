export type Optional<T> = undefined | T;

export type Address = string;

export type Lending = {
  id: string;
  address: Address;
  lender: Address;
  borrower?: Address;
  maxDuration: number;
  actualDuration?: number;
  borrowedAt?: number;
  borrowPrice?: number;
  nftPrice: number;
  face: Face;
};

export type Face = {
  id: string;
  uri: string;
};

export type Approval = {
  id: string;
  nftAddress: Address;
  tokenId: string;
  owner: Address;
  approved: Address;
};

export type ApprovedAll = {
  id: string;
  nftAddress: Address;
  owner: Address;
  approved: Address;
};

export type User = {
  id: string;
  lending: Lending[];
  borrowing: Lending[];
  faces: Face[];
  approvals: Approval[];
  approvedAll: ApprovedAll[];
};

export enum PaymentToken {
  DAI, // 0
  USDC, // 1
  USDT, // 2
  TUSD, // 3
  ETH, // 4
  UNI, // 5
  YFI, // 6
  NAZ, // 7
}
