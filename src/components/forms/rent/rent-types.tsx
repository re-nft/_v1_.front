import { FormState, UseFormRegister } from "react-hook-form/dist/types";
import { Lending } from "../../../types/classes";

export type LendFormProps = {
  checkedItems: string[];
  onClose: () => void;
};
export type FormProps = { inputs: (Lending & { duration: string })[] };

export interface RentItemProps {
  item: Lending & { duration: string };
  removeFromCart: (id: number) => void;
  index: number;
  disabled: boolean;
  register: UseFormRegister<FormProps>;
  formState: FormState<FormProps>;
}
