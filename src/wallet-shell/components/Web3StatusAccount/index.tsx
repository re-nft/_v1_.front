import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import React, { useContext } from "react";
import { NetworkContextName } from "../../constants";
import { useENSName } from "../../state-hooks";
import { shortenAddress } from "../../utils";
import { Web3StatusActions } from "../../index.provider";

import {
  Web3StatusConnected,
  Web3StatusError,
  Text,
  NetworkIcon,
  Web3StatusConnect,
  RowBetween,
} from "./index.styles";
import { Loader } from "../common/Loader";
import { StatusIcon } from "../StatusIcon";
import { WalletModal } from "../WalletModal";

export const Web3StatusAccount: React.FC = () => {
  const { active, account, connector, error } = useWeb3React();
  const contextNetwork = useWeb3React(NetworkContextName);

  const { ENSName } = useENSName(account ?? undefined);
  const { toggleModal } = useContext(Web3StatusActions);

  //TODO:eniko useEventTrackedTransactions
  // this is a nicecities to show if something is in progress or not
  const hasPendingTransactions = false;

  if (!contextNetwork.active && !active) {
    return null;
  }

  return (
    <>
      {account && (
        <Web3StatusConnected
          id="web3-status-connected"
          onClick={toggleModal}
          pending={hasPendingTransactions}
        >
          {hasPendingTransactions ? (
            <RowBetween>
              <Text>{pending?.length} Pending</Text> <Loader stroke="white" />
            </RowBetween>
          ) : (
            <>
              <Text>{ENSName || shortenAddress(account)}</Text>
            </>
          )}
          {!hasPendingTransactions && connector && (
            <StatusIcon connector={connector} />
          )}
        </Web3StatusConnected>
      )}
      {!account && error && (
        <Web3StatusError onClick={toggleModal}>
          <NetworkIcon />
          <Text>
            {error instanceof UnsupportedChainIdError
              ? "Wrong Network"
              : "Error"}
          </Text>
        </Web3StatusError>
      )}
      {!account && !error && (
        <Web3StatusConnect
          id="connect-wallet"
          onClick={toggleModal}
          faded={!account}
        >
          <Text>Connect to a wallet</Text>
        </Web3StatusConnect>
      )}
      <WalletModal ENSName={ENSName ?? undefined} />
    </>
  );
};
