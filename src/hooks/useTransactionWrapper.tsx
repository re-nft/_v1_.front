import { ContractTransaction } from "ethers";
import { useCallback, useContext } from "react";
import { SnackAlertContext } from "../contexts/SnackProvider";
import TransactionStateContext from "../contexts/TransactionState";

export const useTransactionWrapper = () => {
  const { setHash } = useContext(TransactionStateContext);
  const { setError } = useContext(SnackAlertContext);
  
  return useCallback((promise: Promise<ContractTransaction>) => {
    return promise
      .then((tx) => {
        if (tx) return setHash(tx.hash);
        return Promise.resolve(false);
      })
      .then((status) => {
        if (!status) setError("Transaction is not successful!", "warning");
        return Promise.resolve(status);
      })
      .catch((e) => {
        setError(e.message, "error");
      });
  }, [setHash, setError]);
};
