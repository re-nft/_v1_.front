import React, { useCallback, useContext } from "react";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { ExternalLink as LinkIcon } from "react-feather";

import { useActiveWeb3React } from "../../state-hooks";
import { shortenAddress, getEtherscanLink } from "../../utils";
import { injected, walletlink } from "../../connectors";
import { SUPPORTED_WALLETS } from "../../constants";

import { StatusIcon } from "../StatusIcon";
import { Copy } from "./Copy";
import { Transaction } from "./Transaction";

import {
  TransactionListWrapper,
  WalletName,
  UpperSection,
  CloseIcon,
  HeaderRow,
  AccountSection,
  CloseColor,
  InfoCard,
  AccountGroupingRow,
  AccountControl,
  AddressLink,
  LowerSection,
  WalletAction,
  AutoRow,
} from "./AccountDetails.styles";
import { Web3StatusActions } from "../../index.provider";

function getName(connector: AbstractConnector | undefined) {
  const { ethereum } = window;
  const isMetaMask = !!(ethereum && ethereum.isMetaMask);
  const name = Object.keys(SUPPORTED_WALLETS)
    .filter(
      (k) =>
        SUPPORTED_WALLETS[k].connector === connector &&
        (connector !== injected || isMetaMask === (k === "METAMASK"))
    )
    .map((k) => SUPPORTED_WALLETS[k].name)[0];
  return name;
}

interface AccountDetailsProps {
  toggleWalletModal: () => void;
  pendingTransactions: string[];
  confirmedTransactions: string[];
  ENSName?: string;
  openOptions: () => void;
}

export function AccountDetails({
  toggleWalletModal,
  pendingTransactions,
  confirmedTransactions,
  ENSName,
  openOptions,
}: AccountDetailsProps) {
  const { chainId, account, connector } = useActiveWeb3React();
  const { clearAllTransactions } = useContext(Web3StatusActions);

  const clearAllTransactionsCallback = useCallback(() => {
    if (chainId) clearAllTransactions({ chainId });
  }, [chainId, clearAllTransactions]);
  return (
    <>
      <UpperSection>
        <CloseIcon onClick={toggleWalletModal}>
          <CloseColor />
        </CloseIcon>
        <HeaderRow>Account</HeaderRow>
        <AccountSection>
          <InfoCard>
            <AccountGroupingRow>
              <WalletName>Connected with {getName(connector)}</WalletName>
              <div className="flex flex-row">
                {connector !== injected && connector !== walletlink && (
                  <WalletAction
                    onClick={() => {
                      (connector as any).close();
                    }}
                  >
                    Disconnect
                  </WalletAction>
                )}
                <WalletAction onClick={openOptions}>Change</WalletAction>
              </div>
            </AccountGroupingRow>
            <AccountGroupingRow id="web3-account-identifier-row">
              <AccountControl>
                <div className="mr-2">
                  <StatusIcon connector={connector} end />
                </div>
                <p> {ENSName ? ENSName : account && shortenAddress(account)}</p>
              </AccountControl>
            </AccountGroupingRow>
            <AccountGroupingRow>
              <AccountControl>
                {account && (
                  <Copy toCopy={account}>
                    <span style={{ marginLeft: "4px" }}>Copy Address</span>
                  </Copy>
                )}
                {chainId && account && (
                  <AddressLink
                    href={
                      chainId &&
                      getEtherscanLink(chainId, ENSName || account, "address")
                    }
                  >
                    <LinkIcon size={16} />
                    <span style={{ marginLeft: "4px" }}>View on Etherscan</span>
                  </AddressLink>
                )}
              </AccountControl>
            </AccountGroupingRow>
          </InfoCard>
        </AccountSection>
      </UpperSection>
      {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <LowerSection>
          <AutoRow>
            <p>Recent Transactions</p>
            <button
              className="font-medium text-pink-500"
              onClick={clearAllTransactionsCallback}
            >
              (clear all)
            </button>
          </AutoRow>
          <TransactionListWrapper>
            {pendingTransactions.map((hash, i) => {
              return <Transaction key={i} hash={hash} />;
            })}
          </TransactionListWrapper>
          <TransactionListWrapper>
            {confirmedTransactions.map((hash, i) => {
              return <Transaction key={i} hash={hash} />;
            })}
          </TransactionListWrapper>
        </LowerSection>
      ) : (
        <LowerSection>
          <p>Your transactions will appear here...</p>
        </LowerSection>
      )}
    </>
  );
}
