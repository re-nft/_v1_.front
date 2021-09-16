import { FormState, UseFormRegister } from "react-hook-form/dist/types";
import { Lending } from "../../../types/classes";

export type LendFormProps = {
  nfts: Lending[];
  onClose: () => void;
};
export type FormProps = { inputs: Lending[] };

export interface RentItemProps {
  item: Lending;
  removeFromCart: (id: number) => void;
  index: number;
  disabled: boolean;
  register: UseFormRegister<FormProps>;
  formState: FormState<FormProps>;
}
