import React from "react";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { ExternalLinkIcon as LinkIcon } from "@heroicons/react/outline";

import { useActiveWeb3React } from "../../state-hooks";
import { shortenAddress, getEtherscanLink } from "../../utils";
import { injected, walletlink } from "../../connectors";
import { SUPPORTED_WALLETS } from "../../constants";

import { StatusIcon } from "../StatusIcon";
import { Copy } from "./Copy";

import {
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
  WalletAction,
} from "./AccountDetails.styles";

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
  ENSName?: string;
  openOptions: () => void;
}

export const AccountDetails: React.FC<AccountDetailsProps> = ({
  toggleWalletModal,
  ENSName,
  openOptions,
}) => {
  const { chainId, account, connector } = useActiveWeb3React();

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
                    <span className="w-4 h-4">
                      <LinkIcon />
                    </span>
                    <span style={{ marginLeft: "4px" }}>View on Etherscan</span>
                  </AddressLink>
                )}
              </AccountControl>
            </AccountGroupingRow>
          </InfoCard>
        </AccountSection>
      </UpperSection>
    </>
  );
};
