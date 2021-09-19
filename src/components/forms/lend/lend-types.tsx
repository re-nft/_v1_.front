import { FormState, UseFormRegister } from "react-hook-form/dist/types";
import { Nft } from "../../../types/classes";

export type LendFormProps = {
  checkedItems: Set<string>;
  onClose: () => void;
};

export type LendInputProps = {
  amount: string;
  lendAmount: number;
  maxDuration?: number;
  borrowPrice?: number;
  nftPrice?: number;
  tokenId: string;
  pmToken?: number;
  nftAddress: string;
  nft: Nft;
};
export type LendInputDefined = {
  lendAmount: number;
  maxDuration: number;
  borrowPrice: number;
  nftPrice: number;
  tokenId: string;
  pmToken: number;
  nftAddress: string;
  nft: Nft;
};
export type FormProps = { inputs: LendInputProps[] };

export interface ILendInput {
  lendingInput: LendInputProps;
  index: number;
  disabled: boolean;
  removeFromCart: (index: number) => void;
  register: UseFormRegister<FormProps>;
  formState: FormState<FormProps>;
}
