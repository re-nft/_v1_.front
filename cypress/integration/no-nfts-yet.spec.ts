/// <reference types="cypress" />
/// <reference types="../support" />

describe("Site has no NFTs yet", () => {
  before(() => {
    cy.connectDisconnect();
  });

  describe("and user didn't connect their wallet yet", () => {
    it("renting screen shows message: You can't rent anything yet ", () => {
      cy.get(".content__message").should(
        "contain.text",
        "You can't rent anything yet"
      );
    });

    it("is-renting screen shows message: Please connect your wallet!", () => {
      cy.get(".switch__control .toggle").click();
      cy.get(".content__message").should(
        "contain.text",
        "Please connect your wallet!"
      );
    });

    it("lending screen shows message: Please connect your wallet! ", () => {
      cy.visit("/lend");
      cy.get(".content__message").should(
        "contain.text",
        "Please connect your wallet!"
      );
    });

    it("is-lending screen shows message: Please connect your wallet! ", () => {
      cy.visit("/lend");
      cy.get(".switch__control .toggle").click();
      cy.get(".content__message").should(
        "contain.text",
        "Please connect your wallet!"
      );
    });

    it("dashboard screen shows message: Please connect your wallet!", () => {
      cy.visit("/dashboard");
      cy.get(".content__message").should(
        "contain.text",
        "Please connect your wallet!"
      );
    });

    it("profile screen shows message: Please connect your wallet!", () => {
      cy.visit("/profile");
      cy.get(".content__message").should(
        "contain.text",
        "Please connect your wallet!"
      );
    });
  });

  describe.only("and user connected their wallet", () => {
    before(() => {
      cy.connectToAccounts();
    });
    it("renting screen shows message: You can't rent anything yet ", () => {
      cy.get(".content__message").should(
        "contain.text",
        "You can't rent anything yet"
      );
    });

    it("is-renting screen shows message: You are not renting anything yet", () => {
      cy.get(".switch__control .toggle").click();
      cy.get(".content__message").should(
        "contain.text",
        "You are not renting anything yet"
      );
    });

    it("lending screen shows message: You don't have any NFTs to lend", () => {
      cy.visit("/lend");
      cy.get(".content__message").should(
        "contain.text",
        "You don't have any NFTs to lend"
      );
    });

    it("is-lending screen shows message: You are not lending anything yet ", () => {
      cy.visit("/lend");
      cy.get(".switch__control .toggle").click();
      cy.get(".content__message").should(
        "contain.text",
        "You are not lending anything yet"
      );
    });

    it("dashboard screen shows message: You aren't lending or renting yet. To start lending, head to the lend tab.", () => {
      cy.visit("/dashboard");
      cy.get(".content__message").should(
        "contain.text",
        "You aren't lending or renting yet. To start lending, head to the lend tab."
      );
    });
  });
});
