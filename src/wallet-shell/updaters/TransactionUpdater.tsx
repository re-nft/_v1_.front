import { useContext, useEffect } from "react";
import { useActiveWeb3React, useBlockNumber } from "../state-hooks";
import { Web3StatusActions, Web3StatusState } from "../index.provider";
import { SerializableTransactionReceipt } from "../types";

export function shouldCheck(
  lastBlockNumber: number,
  tx: {
    addedTime: number;
    receipt?: SerializableTransactionReceipt;
    lastCheckedBlockNumber?: number;
  }
): boolean {
  if (tx.receipt) return false;
  if (!tx.lastCheckedBlockNumber) return true;
  const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber;
  if (blocksSinceCheck < 1) return false;
  const minutesPending = (new Date().getTime() - tx.addedTime) / 1000 / 60;
  if (minutesPending > 60) {
    // every 10 blocks if pending for longer than an hour
    return blocksSinceCheck > 9;
  } else if (minutesPending > 5) {
    // every 3 blocks if pending more than 5 minutes
    return blocksSinceCheck > 2;
  } else {
    // otherwise every block
    return true;
  }
}

export function TransactionUpdater(): null {
  const { chainId, library } = useActiveWeb3React();
  const { transactions: allTransactions } = useContext(Web3StatusState);
  const { checkedTransaction, finalizeTransaction, addPopup } =
    useContext(Web3StatusActions);

  const lastBlockNumber = useBlockNumber();

  // show popup on confirm

  useEffect(() => {
    const transactions = chainId ? allTransactions[chainId] ?? {} : {};

    if (!chainId || !library || !lastBlockNumber) return;

    Object.keys(transactions)
      .filter((hash) => shouldCheck(lastBlockNumber, transactions[hash]))
      .forEach((hash) => {
        library
          .getTransactionReceipt(hash)
          .then((receipt: SerializableTransactionReceipt) => {
            if (receipt) {
              finalizeTransaction({
                chainId,
                hash,
                receipt: {
                  blockHash: receipt.blockHash,
                  blockNumber: receipt.blockNumber,
                  contractAddress: receipt.contractAddress,
                  from: receipt.from,
                  status: receipt.status,
                  to: receipt.to,
                  transactionHash: receipt.transactionHash,
                  transactionIndex: receipt.transactionIndex,
                },
              });

              addPopup({
                content: {
                  txn: {
                    hash,
                    success: receipt.status === 1,
                    summary: transactions[hash]?.summary,
                  },
                },
                key: hash,
              });
            } else {
              checkedTransaction({
                chainId,
                hash,
                blockNumber: lastBlockNumber,
              });
            }
          })
          .catch((error: unknown) => {
            console.error(`failed to check transaction hash: ${hash}`, error);
          });
      });
  }, [
    chainId,
    library,
    lastBlockNumber,
    finalizeTransaction,
    addPopup,
    checkedTransaction,
    allTransactions,
  ]);

  return null;
}
