/// <reference types="cypress" />
/// <reference types="../support" />

describe("Lending", () => {
  describe("lending i721a", () => {
    describe("single lending", () => {
      before(() => {
        cy.connectDisconnect();
        cy.connectToAccounts();
        // mint i721
        // Change account to third one, as that doesn't have any nfts yet
        cy.changeAccount(3);
        cy.mint_i721a();
        cy.wait(5000);
      });
      it("user has an i721a", () => {
        cy.visit("/lend");
        cy.wait(20_000);
        cy.get(".content__items .nft.nft__erc721").should(
          "have.length.at.least",
          1
        );
      });

      it("when the user clicks on NFT's catalogue item lending button form shows up", () => {
        cy.get(":nth-child(1) > .nft__control > .nft__button").first().click();
        cy.get(
          ".modal-dialog .modal-dialog-section .modal-dialog-section"
        ).should("have.length", 1);
      });
      // it("can approve the nft to lend without filling out details", () => {
      //   cy.get(
      //     ".modal-dialog-button > :nth-child(1) > .nft__control > .nft__button"
      //   ).click();
      // });
      // it("loading state is shown while approval is mined", () => {
      //   cy.get('[data-cy="transaction-loading"]');
      //   cy.confirmMetamaskTransaction();
      // });
      it("lending button is shown with disabled state after approval successful", () => {
        cy.wait(2000);
        cy.get(".nft__control .nft__button").should("be.disabled");
      });
      it("can fills out i721 lending details after approval", () => {
        cy.get("#inputs\\.0\\.maxDuration").type("10");
        cy.get("#inputs\\.0\\.borrowPrice").type("10");
        cy.get("#inputs\\.0\\.nftPrice").type("10");
        cy.selectWETH()
      });
      it("can click on lending button", () => {
        cy.get(".modal-dialog-button > :nth-child(1) > .nft__control > .nft__button").should("not.be.disabled").click();
      });
      it("lending button changes to loading state", () => {
        cy.get('[data-cy="transaction-loading"]');
      });
      it('lending modal self closes after successful transaction', () => {
        cy.confirmMetamaskTransaction();
        cy.wait(2000)
        cy.get("body").then(($body) => {
          if ($body.find(".modal-dialog").length) {
            cy.get('.modal-dialog').should('not.be.visible')
          }
        });
      })

      it("then the items shows up in is-lending screen", () => {
        cy.get(".toggle").click();
        cy.get(".content__items .nft .nft__erc721").should("have.length", 1);
      });
      // it("and the item shows up in dashboard lending section with correct details", () => {
      //   cy.visit("/dashboard").click();
      //   cy.get(".content__items .nft .nft__erc721").should("have.length", 1);
      // });
      // it("and the item shows up in renting", () => {
      //   cy.visit("/renting");
      //   cy.get(".content__items .nft .nft__erc721").should("have.length", 1);
      // });
      // it("and the item shows up in different user renting tab", () => {
      //   cy.changeAccount(2);
      //   cy.get(".content__items .nft .nft__erc721").should("have.length", 1);
      // });
    });
  });
});
