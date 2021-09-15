import { FormState, UseFormRegister } from "react-hook-form/dist/types";
import { Lending } from "../../../types/classes";

export type LendFormProps = {
  nfts: Lending[];
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
