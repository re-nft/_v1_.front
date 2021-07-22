import React from 'react';

export const InstallMetamask = () => {
    return (
      <div id="installMetaMask" className="cjAFRf web3modal-provider-wrapper">
        <a
          href="https://metamask.io/"
          target="_blank"
          className="cjAFRf web3modal-provider-container"
          rel="noreferrer"
        >
          <div className="jMhaxE web3modal-provider-icon">
            <img src="/metamask.svg" alt="MetaMask" width="32px" height="32px" />
          </div>
          <div className="bktcUM sc-web3modal-provider-name mt-0">
            Install MetaMask
          </div>
        </a>
      </div>
    );
  };