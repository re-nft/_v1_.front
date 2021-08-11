// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

const { Contract } = require("@ethersproject/contracts");
const contractList = require("../../src/contracts/contracts.js");
//const detectEthereumProvider = require("@metamask/detect-provider");
const ethers = require("ethers");

const getSigner = async () => {
  //const prov = await detectEthereumProvider();
  const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = await web3Provider.getSigner();
  return signer;
};

const loadContract = (contractName, signer) => {
  const newContract = new Contract(
    require(`../../src/contracts/${contractName}.address.js`),
    require(`../../src/contracts/${contractName}.abi.js`),
    signer
  );
  try {
    // @ts-ignore
    newContract.bytecode = require(`../../src/contracts/${contractName}.bytecode.js`);
  } catch (e) {
    console.log(e);
  }
  return newContract;
};

async function loadContracts(signer) {
  try {
    const newContracts = {};
    contractList.forEach((contractName) => {
      const nameWithoutTest = contractName.replace("Test/", "");

      // TODO investigate
      // @ts-ignore
      newContracts[nameWithoutTest] = loadContract(contractName, signer);
    });
  } catch (e) {
    console.log("ERROR LOADING CONTRACTS!!", e);
  }
}

const mintE20 = async (e20) => {
  const signer = await getSigner();
  const { WETH, DAI, USDC, USDT, TUSD } = loadContracts(signer);

  switch (e20) {
    case 1:
      if (!WETH) return;
      await (await WETH.faucet()).wait();
      break;
    case 2:
      if (!DAI) return;
      await (await DAI.faucet()).wait();
      break;
    case 3:
      if (!USDC) return;
      await (await USDC.faucet()).wait();
      break;
    case 4:
      if (!USDT) return;
      await (await USDT.faucet()).wait();
      break;
    case 5:
      if (!TUSD) return;
      await (await TUSD.faucet()).wait();
      break;
  }
};

const mintNFT = async (nft) => {
  const signer = await getSigner();
  const { E721, E721B, E1155, E1155B } = loadContracts(signer);

  switch (nft) {
    case 0:
      if (!E721) return;
      await (await E721.faucet()).wait();
      break;
    case 1:
      if (!E721B) return;
      await (await E721B.faucet()).wait();
      break;
    case 2:
      if (!E1155) return;
      // @ts-ignore
      await (await E1155.faucet(10)).wait();
      break;
    case 3:
      if (!E1155B) return;
      // @ts-ignore
      await (await E1155B.faucet(10)).wait();
      break;
    default:
      debug("unknown NFT");
      return;
  }
};

Cypress.Commands.add("connectToAccounts", (token) => {
  cy.get("body").then(($body) => {
    // synchronously ask for the body's text
    // and do something based on whether it includes
    // another string
    if ($body.find("[data-cy=metamask-connect-button]").length) {
      cy.get("[data-cy=metamask-connect-button]").click();
      cy.acceptMetamaskAllAccess();
    } else {
      //already connected
    }
  });
});

Cypress.Commands.add("addDefaultAccounts", () => {
  cy.getAccountsLength().then((length) => {
    if (length !== 5) {
      cy.switchToMetamaskWindow();
      // add 4 more accounts
      cy.addAccount();
      cy.addAccount();
      cy.addAccount();
      cy.addAccount();
      cy.switchToCypressWindow();
    }
  });
});

Cypress.Commands.add("connectDisconnect", () => {
  cy.setupMetamask();
  cy.changeMetamaskNetwork("localhost2");
  cy.visit("/");
  cy.addDefaultAccounts();
  cy.wait(2000);
});

Cypress.Commands.add("mint_i721a", () => {
  mintNFT(0);
});
Cypress.Commands.add("mint_i721b", () => {
  mintNFT(1);
});

Cypress.Commands.add("mint_i1155a", () => {
  mintNFT(2);
});

Cypress.Commands.add("mint_i1155b", () => {
  mintNFT(3);
});

Cypress.Commands.add("mintWETH", () => {
  mintE20(1);
});
Cypress.Commands.add("mintDAI", () => {
  mintE20(2);
});

Cypress.Commands.add("mintUSDC", () => {
  mintE20(3);
});

Cypress.Commands.add("mintUSDT", () => {
  mintE20(4);
});

Cypress.Commands.add("mintTUSD", () => {
  mintE20(5);
});

Cypress.Commands.add('selectWETH', () => {
  cy.get("#mui-component-select-inputs\\.0\\.pmToken").click();
  cy.get(".MuiMenu-list > li:nth-child(2)").click();
})
Cypress.Commands.add('selectDAI', () => {
  cy.get("#mui-component-select-inputs\\.0\\.pmToken").click();
  cy.get(".MuiMenu-list > li:nth-child(3)").click();
})
Cypress.Commands.add('selectUSDC', () => {
  cy.get("#mui-component-select-inputs\\.0\\.pmToken").click();
  cy.get(".MuiMenu-list > li:nth-child(4)").click();
})
Cypress.Commands.add('selectUSDT', () => {
  cy.get("#mui-component-select-inputs\\.0\\.pmToken").click();
  cy.get(".MuiMenu-list > li:nth-child(5)").click();
})
Cypress.Commands.add('selectTUSD', () => {
  cy.get("#mui-component-select-inputs\\.0\\.pmToken").click();
  cy.get(".MuiMenu-list > li:nth-child(6)").click();
})