import { useActiveWeb3React, useETHBalances } from "../state-hooks";
import React from "react";
import { NETWORK_LABELS } from "../constants";
import { Web3StatusAccount } from "./Web3StatusAccount";
import {
  HeaderElement,
  AccountElement,
  NetworkCard,
  BalanceText,
} from "../index.styles";

export const Web3Status: React.FC = () => {
  const { account, chainId } = useActiveWeb3React();

  const userEthBalance = useETHBalances(account ? [account] : [])?.[
    account ?? ""
  ];

  return (
    <HeaderElement>
      {chainId && NETWORK_LABELS[chainId] && (
        <NetworkCard>{NETWORK_LABELS[chainId]}</NetworkCard>
      )}
      <AccountElement>
        {account && userEthBalance && (
          <BalanceText>{userEthBalance?.toSignificant(4)} ETH</BalanceText>
        )}
        <Web3StatusAccount />
      </AccountElement>
    </HeaderElement>
  );
};

export default Web3Status;
