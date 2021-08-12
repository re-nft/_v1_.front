/// <reference types="cypress" />
/// <reference types="../support" />

describe("User can load page", () => {
  // TODO this case cannot be tested as the plugin installs metamask before the browser startsup
  // it("is expected to display an install message", () => {
  //   cy.switchToCypressWindow()
  //   cy.get("[data-cy=title]").should("contain.text", "No MetaMask Detected - please install the extension!");
  // });

  describe("and metamask is installed", () => {
    before(() => {
      cy.connectDisconnect();
    });
    describe("connection button should be shown", () => {
      it("is expected to display a metamask message", () => {
        cy.get("[data-cy=metamask-connect-button]").should(
          "contain.text",
          "Please connect your wallet!"
        );
      });
    });
    describe("should show account details after connect", () => {
      before(() => {
        cy.connectToAccounts();
      });

      it("is expected to display the local wallet address", () => {
        cy.get(".header__user > a > span").should("contain.text", "Account 1");
      });
    });
  });
});
