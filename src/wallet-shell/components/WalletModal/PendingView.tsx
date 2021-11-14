import { AbstractConnector } from "@web3-react/abstract-connector";
import React, { useMemo } from "react";
import { Option } from "./Option";
import { SUPPORTED_WALLETS } from "../../constants";
import { injected } from "../../connectors";
import {
  PendingSection,
  LoadingMessage,
  LoadingWrapper,
  ErrorGroup,
  ErrorButton,
  StyledLoader,
} from "./PendingView.styles";

interface Props {
  connector?: AbstractConnector;
  error?: boolean;
  setPendingError: (_error: boolean) => void;
  tryActivation: (_connector: AbstractConnector) => void;
}

function filterWallet(
  connector: AbstractConnector | undefined,
  isMetamask: boolean
) {
  return (key: string) => {
    const option = SUPPORTED_WALLETS[key];
    if (option.connector === connector) {
      if (option.connector === injected) {
        if (isMetamask && option.name !== "MetaMask") {
          return false;
        }
        if (!isMetamask && option.name === "MetaMask") {
          return false;
        }
      }
      return true;
    }
    return false;
  };
}
export function PendingView({
  connector,
  error = true,
  setPendingError,
  tryActivation,
}: Props) {
  const isMetamask = !!window?.ethereum?.isMetaMask;
  const supportedWallets = useMemo(() => {
    return Object.keys(SUPPORTED_WALLETS).filter(
      filterWallet(connector, isMetamask)
    );
  }, [isMetamask, connector]);
  return (
    <PendingSection>
      <LoadingMessage hasError={error}>
        {error && (
          <ErrorGroup>
            <div>Error connecting.</div>
            <ErrorButton
              onClick={() => {
                setPendingError(false);
                connector && tryActivation(connector);
              }}
            >
              Try Again
            </ErrorButton>
          </ErrorGroup>
        )}
        {!error && (
          <LoadingWrapper>
            <StyledLoader />
            Initializing...
          </LoadingWrapper>
        )}
      </LoadingMessage>
      {supportedWallets.map((key) => {
        const option = SUPPORTED_WALLETS[key];
        return (
          <Option
            id={`connect-${key}`}
            key={key}
            clickable={false}
            color={option.color}
            header={option.name}
            subheader={option.description}
            icon={"/assets/images/" + option.iconName}
          />
        );
      })}
    </PendingSection>
  );
}
