// in cypress/support/index.ts
// load type definitions that come with Cypress module
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    // BEGIN: cypress-metamask commands
    acceptMetamaskAccess(): Chainable<Element>;
    setupMetamask(): Chainable<Element>;
    changeMetamaskNetwork(network: string): Chainable<Element>;
    disconnectAccounts(account: number[]): Chainable<Element>;
    getAccountsLength(): number;
    addAccount(): Chainable<Element>;
    confirmMetamaskTransaction(): Chainable<Element>;
    changeAccount(n: number): Chainable<Element>;
    unlock(): Chainable<Element>;
    addNetwork(): Chainable<Element>;
    acceptAccess(): Chainable<Element>;
    acceptAllAccess(): Chainable<Element>;
    rejectTransaction(): Chainable<Element>;
    addNetwork(): Chainable<Element>;
    initialSetup(): Chainable<Element>;
    switchToMetamaskWindow(): Chainable<Element>;
    switchToCypressWindow(): Chainable<Element>;
    // END: cypress-metamask commands

    //BEGIN: local commands
    connectToAccounts(): Chainable<Element>;
    connectDisconnect(): Chainable<Element>;
    addDefaultAccounts(): Chainable<Element>;
    //mint nfts
    mint_i721a(): Chainable<Element>;
    mint_i721b(): Chainable<Element>;
    mint_i1155a(): Chainable<Element>;
    mint_i1155b(): Chainable<Element>;
    // mint tokens
    mintWETH(): Chainable<Element>;
    mintDAI(): Chainable<Element>;
    mintUSDC(): Chainable<Element>;
    mintUSDT(): Chainable<Element>;
    mintTUSD(): Chainable<Element>;
    selectWETH(): Chainable<Element>;
    selectDAI(): Chainable<Element>;
    selectUSDC(): Chainable<Element>;
    selectUSDT(): Chainable<Element>;
    selectTUSD(): Chainable<Element>;
    //END: local commands
  }
}
