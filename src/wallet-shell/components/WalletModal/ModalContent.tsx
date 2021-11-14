import { ExternalLink } from "../common/ExternalLink";
import { AccountDetails } from "../AccountDetails/AccountDetails";
import { PendingView } from "./PendingView";
import {
  UpperSection,
  CloseIcon,
  ContentWrapper,
  CloseColor,
  HeaderRow,
  HoverText,
  OptionGrid,
  Blurb,
} from "./ModalContent.styles";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { WALLET_VIEWS } from "../../constants";
import { Options } from "./Options";
import { AbstractConnector } from "@web3-react/abstract-connector";
import React, { useEffect, useState, useContext } from "react";
import { Web3StatusState } from "../../index.provider";
import usePrevious from "../../hooks/usePrevious";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

interface Props {
  toggleModal: () => void;
  ENSName?: string;
  connector?: AbstractConnector;
}

export const ModalContent: React.FC<Props> = ({ toggleModal, ENSName }) => {
  const { active, account, connector, activate, error } = useWeb3React();
  const {
    application: { modalOpen },
  } = useContext(Web3StatusState);

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT);
  const [pendingError, setPendingError] = useState<boolean>();
  const [pendingWallet, setPendingWallet] = useState<
    AbstractConnector | undefined
  >();

  // always reset to account view
  useEffect(() => {
    if (modalOpen) {
      setPendingError(false);
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [modalOpen]);

  // close modal when a connection is successful
  const activePrevious = usePrevious(active);
  const connectorPrevious = usePrevious(connector);
  useEffect(() => {
    if (
      modalOpen &&
      ((active && !activePrevious) ||
        (connector && connector !== connectorPrevious && !error))
    ) {
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [
    setWalletView,
    active,
    error,
    connector,
    modalOpen,
    activePrevious,
    connectorPrevious,
  ]);

  const tryActivation = async (connector: AbstractConnector | undefined) => {
    // TODO lookup web3
    // const name = Object.keys(SUPPORTED_WALLETS).find((key) => {
    //   if (connector === SUPPORTED_WALLETS[key].connector) {
    //     return SUPPORTED_WALLETS[key].name
    //   }
    //   return true
    // })

    setPendingWallet(connector); // set wallet for pending view
    setWalletView(WALLET_VIEWS.PENDING);

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (
      connector instanceof WalletConnectConnector &&
      connector.walletConnectProvider?.wc?.uri
    ) {
      connector.walletConnectProvider = undefined;
    }

    connector &&
      activate(connector, undefined, true).catch((error: unknown) => {
        if (error instanceof UnsupportedChainIdError) {
          activate(connector); // a little janky...can't use setError because the connector isn't set
        } else {
          setPendingError(true);
        }
      });
  };
  if (error) {
    return (
      <UpperSection>
        <CloseIcon onClick={toggleModal}>
          <CloseColor />
        </CloseIcon>
        <HeaderRow>
          {error instanceof UnsupportedChainIdError
            ? "Wrong Network"
            : "Error connecting"}
        </HeaderRow>
        <ContentWrapper>
          {error instanceof UnsupportedChainIdError ? (
            <h5>Please connect to the appropriate Ethereum network.</h5>
          ) : (
            "Error connecting. Try refreshing the page."
          )}
        </ContentWrapper>
      </UpperSection>
    );
  }
  if (account && walletView === WALLET_VIEWS.ACCOUNT) {
    return (
      <AccountDetails
        toggleWalletModal={toggleModal}
        ENSName={ENSName}
        openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
      />
    );
  }
  return (
    <UpperSection>
      <CloseIcon onClick={toggleModal}>
        <CloseColor />
      </CloseIcon>
      {walletView !== WALLET_VIEWS.ACCOUNT ? (
        <HeaderRow isBlue>
          <HoverText
            onClick={() => {
              setPendingError(false);
              setWalletView(WALLET_VIEWS.ACCOUNT);
            }}
          >
            Back
          </HoverText>
        </HeaderRow>
      ) : (
        <HeaderRow>
          <HoverText>Connect to a wallet</HoverText>
        </HeaderRow>
      )}
      <ContentWrapper>
        {walletView === WALLET_VIEWS.PENDING && (
          <PendingView
            connector={pendingWallet}
            error={pendingError}
            setPendingError={setPendingError}
            tryActivation={tryActivation}
          />
        )}
        {walletView !== WALLET_VIEWS.PENDING && (
          <>
            <OptionGrid>
              <Options {...{ connector, tryActivation, setWalletView }} />
            </OptionGrid>
            <Blurb>
              <span>New to Ethereum? &nbsp;</span>
              <ExternalLink href="https://ethereum.org/wallets/">
                Learn more about wallets
              </ExternalLink>
            </Blurb>
          </>
        )}
      </ContentWrapper>
    </UpperSection>
  );
};
