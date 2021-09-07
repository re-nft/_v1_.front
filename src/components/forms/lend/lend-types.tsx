import { Observable } from "rxjs";
import { TransactionStatus } from "../../../hooks/useTransactionWrapper";
import { Nft } from "../../../types/classes";

export type LendFormProps = {
  nfts: Nft[];
  isApproved: boolean;
  handleApproveAll: () => void;
  handleSubmit: (arg: LendInputDefined[]) => Observable<TransactionStatus>;
  approvalStatus: TransactionStatus;
  onClose: () => void;
};

export type LendInputProps = {
  amount: string;
  lendAmount: number | undefined;
  maxDuration: number | undefined;
  borrowPrice: number | undefined;
  nftPrice: number | undefined;
  tokenId: string;
  pmToken: number | undefined;
  key: string;
  nft: Nft;
};
export type LendInputDefined = {
  lendAmount: number;
  maxDuration: number;
  borrowPrice: number;
  nftPrice: number;
  tokenId: string;
  pmToken: number;
  key: string;
  nft: Nft;
};
export type FormProps = { inputs: LendInputProps[] };
