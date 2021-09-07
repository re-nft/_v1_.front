import { FormikErrors, FormikTouched } from "formik/dist/types";
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
export interface LendingWithKey extends Lending {
  key: string;
  duration: number | undefined;
}
export type FormProps = { inputs: LendingWithKey[] };

export interface RentItemProps {
  item: LendingWithKey;
  handleBlur: {
    (e: React.FocusEvent<unknown>): void;
    <T = unknown>(fieldOrEvent: T): T extends string
      ? (e: unknown) => void
      : void;
  };
  handleChange: {
    (e: React.ChangeEvent<unknown>): void;
    <T = string | React.ChangeEvent<unknown>>(
      field: T
    ): T extends React.ChangeEvent<unknown>
      ? void
      : (e: string | React.ChangeEvent<unknown>) => void;
  };
  removeFromCart: (id: number) => void;
  index: number;
  touched: FormikTouched<LendingWithKey> | null;
  errors: FormikErrors<LendingWithKey> | null;
  disabled: boolean;
}
