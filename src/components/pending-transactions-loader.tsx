import { useMemo } from "react";
import { TransactionStateEnum } from "renft-front/types";

const IMAGE_PENDING = "/assets/loading-pending.gif";
const IMAGE_SUCCESS = "/assets/loading-success.png";
const IMAGE_FAILURE = "/assets/loading-failed.png";

export const PendingTransactionsLoader: React.FC<{
  status: TransactionStateEnum | null | undefined;
}> = ({ status }) => {
  const imageSource = useMemo(() => {
    if (!status) return null;
    switch (status) {
      case TransactionStateEnum.FAILED:
        return IMAGE_FAILURE;
      case TransactionStateEnum.SUCCESS:
        return IMAGE_SUCCESS;
      case TransactionStateEnum.PENDING:
        return IMAGE_PENDING;
      default:
        return null;
    }
  }, [status]);

  if (!imageSource) return null;

  return (
    <img
      src={imageSource}
      aria-label="transaction-status-loader"
      alt="transaction status"
    ></img>
  );
};
