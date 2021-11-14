import { useActiveWeb3React } from "../state-hooks";
import React from "react";
import { NETWORK_LABELS } from "../constants";
import { Web3StatusAccount } from "./Web3StatusAccount";
import { HeaderElement, AccountElement, NetworkCard } from "../index.styles";

export const Web3Status: React.FC = () => {
  const { chainId } = useActiveWeb3React();

  return (
    <HeaderElement>
      {chainId && NETWORK_LABELS[chainId] && (
        <NetworkCard>{NETWORK_LABELS[chainId]}</NetworkCard>
      )}
      <AccountElement>
        <Web3StatusAccount />
      </AccountElement>
    </HeaderElement>
  );
};

export default Web3Status;
