import { FormState, UseFormRegister } from "react-hook-form/dist/types";
import { Observable } from "rxjs";
import { StartRentNft } from "../../../hooks/contract/useStartRent";
import { TransactionStatus } from "../../../hooks/useTransactionWrapper";
import { Lending } from "../../../types/classes";

export type LendFormProps = {
  nfts: Lending[];
  isApproved: boolean;
  handleApproveAll: () => void;
  handleSubmit: (arg: StartRentNft[]) => Observable<TransactionStatus>;
  approvalStatus: TransactionStatus;
  onClose: () => void;
};
export interface LendingWithDuration extends Lending {
  duration?: number;
}
export type FormProps = { inputs: LendingWithDuration[] };

export interface RentItemProps {
  item: LendingWithDuration;
  removeFromCart: (id: number) => void;
  index: number;
  disabled: boolean;
  register: UseFormRegister<FormProps>;
  formState: FormState<FormProps>;
}
