import { Contract } from "@ethersproject/contracts";
import React, { createContext, useEffect, useState, useContext } from "react";
import { Signer } from "@ethersproject/abstract-signer";
import {
  ReNFT,
  Resolver,
  E721,
  E721B,
  E1155,
  E1155B,
  WETH,
  DAI,
  USDC,
  USDT,
  TUSD,
} from "../hardhat/typechain";
import UserContext from "./UserProvider";
import contractList from "../contracts/contracts";

interface ContractsObject {
  reNFT?: ReNFT;
  Resolver?: Resolver;
  E721?: E721;
  E721B?: E721B;
  E1155?: E1155;
  E1155B?: E1155B;
  WETH?: WETH;
  DAI?: DAI;
  USDC?: USDC;
  USDT?: USDT;
  TUSD?: TUSD;
}

export const ContractContext = createContext<ContractsObject>({});

const loadContract = (contractName: string, signer: Signer | undefined) => {
  const newContract = new Contract(
    require(`../../contracts/${contractName}.address.js`),
    require(`../../contracts/${contractName}.abi.js`),
    // Note has to do with versions mismatch between different ethers libraries
    // @ts-ignore
    signer
  );
  try {
    // @ts-ignore
    newContract.bytecode = require(`../../contracts/${contractName}.bytecode.js`);
  } catch (e) {
    console.log(e);
  }
  switch (contractName) {
    case "ReNFT":
      return newContract as unknown as ReNFT;
    case "Resolver":
      return newContract as unknown as Resolver;
    case "E721":
      return newContract as unknown as E721;
    case "E721B":
      return newContract as unknown as E721B;
    case "E1155":
      return newContract as unknown as E1155;
    case "E1155B":
      return newContract as unknown as E1155B;
    case "WETH":
      return newContract as unknown as WETH;
    case "DAI":
      return newContract as unknown as DAI;
    case "USDC":
      return newContract as unknown as USDC;
    case "USDT":
      return newContract as unknown as USDT;
    case "TUSD":
      return newContract as unknown as TUSD;
    default:
      return newContract;
  }
};

async function loadContracts(
  signer: Signer | undefined,
  setContracts: (arg: ContractsObject) => void
) {
  try {
    const newContracts: ContractsObject = {};
    contractList.forEach((contractName) => {
      const name: keyof ContractsObject = (contractName[0].toLowerCase() +
        contractName.slice(1)) as keyof ContractsObject;
      console.log(contractName[0].toLowerCase() + contractName.slice(1));
      // TODO investigate
      // @ts-ignore
      newContracts[name] = loadContract(contractName, signer);
    });

    setContracts(newContracts);
  } catch (e) {
    console.log("ERROR LOADING CONTRACTS!!", e);
  }
}

export const ContractsProvider: React.FC = ({ children }) => {
  const { signer } = useContext(UserContext);

  const [contracts, setContracts] = useState<ContractsObject>({});
  useEffect(() => {
    loadContracts(signer, setContracts);
  }, [signer]);

  return (
    <ContractContext.Provider value={contracts}>
      {children}
    </ContractContext.Provider>
  );
};
