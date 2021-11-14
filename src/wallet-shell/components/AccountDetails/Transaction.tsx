import React from "react";
import { CheckCircle, Triangle } from "react-feather";
import { useActiveWeb3React, useAllTransactions } from "../../state-hooks";
import { getEtherscanLink } from "../../utils";
import { Loader } from "../common/Loader";
import {
  TransactionState,
  TransactionStatusText,
  RowFixed,
} from "./Transactions.styles";

export function Transaction({ hash }: { hash: string }) {
  const { chainId } = useActiveWeb3React();
  const allTransactions = useAllTransactions();

  if (!chainId) return null;

  const tx = allTransactions?.[hash];
  const summary = tx?.summary;
  const pending = !tx?.receipt;
  const success =
    !pending &&
    tx &&
    (tx.receipt?.status === 1 || typeof tx.receipt?.status === "undefined");
  const href = getEtherscanLink(chainId, hash, "transaction");

  return (
    <div>
      <TransactionState href={href}>
        <RowFixed>
          <TransactionStatusText>{summary ?? hash} ↗</TransactionStatusText>
        </RowFixed>
        {pending ? (
          <Loader stroke="#EC4899" />
        ) : success ? (
          <CheckCircle size="16" color="#10B981" />
        ) : (
          <Triangle size="16" color="#EF4444" />
        )}
      </TransactionState>
    </div>
  );
}
