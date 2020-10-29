export type Optional<T> = undefined | T;

export type Nft = {
  id: string;
  address: string;
  lender: string;
  borrower?: string;
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

export type User = {
  id: string;
  lending: Nft[];
  borrowing: Nft[];
  faces: Face[];
};
