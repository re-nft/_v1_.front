import { createContext } from "react";

type Nft = {
  id: string;
  address: string;
  lender: string;
  borrower: string;
  maxDuration: number;
  actualDuration: number;
  borrowedAt: number;
  borrowPrice: number;
  nftPrice: number;
  face: Face;
};

type Face = {
  id: string;
  uri: string;
};

type User = {
  id: string;
  lending: Nft[];
  borrowing: Nft[];
  faces: Face[];
};

type DefaultGraphContextType = {
  nfts: Nft[];
  user?: User;
};

const DefaultGraphContext: DefaultGraphContextType = {
  nfts: []
};

const GraphContext = createContext(DefaultGraphContext);

export default GraphContext;
