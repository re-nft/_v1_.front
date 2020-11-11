export type Optional<T> = undefined | T;

export type Address = string;

export type Nft = {
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
  lending: Nft[];
  borrowing: Nft[];
  faces: Face[];
  approvals: Approval[];
  approvedAll: ApprovedAll[];
};
