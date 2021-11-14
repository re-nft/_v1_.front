import React, { useEffect, useContext, ReactNode } from "react";
import { useWeb3React } from "@web3-react/core";

import usePrevious from "../../hooks/usePrevious";
import { Web3StatusState, Web3StatusActions } from "../../index.provider";

import { Modal } from "../common/Modal";
import { ModalContent } from "./ModalContent";

interface Props {
  ENSName?: string;
}

const Wrapper = ({ children }: { children: ReactNode }) => {
  return <div className="w-full">{children}</div>;
};

export const WalletModal: React.FC<Props> = ({ ENSName }) => {
  // important that these are destructed from the account-specific web3-react context
  const { account, connector } = useWeb3React();
  const {
    application: { modalOpen },
  } = useContext(Web3StatusState);
  const { toggleModal } = useContext(Web3StatusActions);

  const previousAccount = usePrevious(account);

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && modalOpen) {
      toggleModal();
    }
  }, [account, previousAccount, toggleModal, modalOpen]);

  return (
    <Modal
      isOpen={modalOpen}
      onDismiss={toggleModal}
      minHeight={false}
      maxHeight={90}
    >
      <Wrapper>
        <ModalContent
          {...{
            toggleModal,
            ENSName,
            connector,
          }}
        />
      </Wrapper>
    </Modal>
  );
};
