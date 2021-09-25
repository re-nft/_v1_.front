import { useMemo } from "react";
import { TransactionStateEnum } from "../types";

const IMAGE_PENDING = "/assets/loading-pending.gif";
const IMAGE_SUCCESS = "/assets/loading-success.png";
const IMAGE_FAILURE = "/assets/loading-failed.png";

export const PendingTransactionsLoader: React.FC<{
  status: TransactionStateEnum;
}> = ({ status }) => {
  const imageSource = useMemo(() => {
    switch (status) {
      case TransactionStateEnum.FAILED:
        return IMAGE_FAILURE;
      case TransactionStateEnum.SUCCESS:
        return IMAGE_SUCCESS;
      case TransactionStateEnum.PENDING:
        return IMAGE_PENDING;
    }
  }, [status]);
  return <img src={imageSource}></img>;
};
