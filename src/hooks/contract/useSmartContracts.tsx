import { Contract } from "@ethersproject/contracts";
import { useCallback, useEffect } from "react";
import { Signer } from "@ethersproject/abstract-signer";
import { ReNFT } from "../../types/typechain/ReNFT";
import { Resolver } from "../../types/typechain/Resolver";
import { E721 } from "../../types/typechain/E721";
import { E721B } from "../../types/typechain/E721B";
import { E1155 } from "../../types/typechain/E1155";
import { E1155B } from "../../types/typechain/E1155B";
import { WETH } from "../../types/typechain/WETH";
import { DAI } from "../../types/typechain/DAI";
import { USDC } from "../../types/typechain/USDC";
import { USDT } from "../../types/typechain/USDT";
import { TUSD } from "../../types/typechain/TUSD";
import { Utils } from "../../types/typechain/Utils";
import * as contractList from "../../contracts/contracts.js";
import create from "zustand";
import shallow from "zustand/shallow";
import produce from "immer";
import { useWallet } from "../store/useWallet";

interface ContractsObject {
  ReNFT?: ReNFT;
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
  Utils?: Utils;
}

const loadContract = (contractName: string, signer: Signer | undefined) => {
  const newContract = new Contract(
    require(`../../contracts/${contractName}.address.js`),
    require(`../../contracts/${contractName}.abi.js`),
    signer
  );
  try {
    // @ts-ignore
    newContract.bytecode = require(`../../contracts/${contractName}.bytecode.js`);
  } catch (e) {
    console.log(e);
  }
  const name = contractName.replace("Test/", "");
  switch (name) {
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
    case "Utils":
      return newContract as unknown as Utils;
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
      const nameWithoutTest = contractName.replace("Test/", "");

      // TODO investigate
      // @ts-ignore
      newContracts[nameWithoutTest] = loadContract(contractName, signer);
    });

    setContracts(newContracts);
  } catch (e) {
    console.log("ERROR LOADING CONTRACTS!!", e);
  }
}
const useContractsState = create<{
  contracts: ContractsObject;
  setContracts: (c: ContractsObject) => void;
}>((set) => ({
  contracts: {},

  setContracts: (contracts) =>
    set(
      produce((state) => {
        state.contracts = contracts;
      })
    ),
}));
export const useSmartContracts = () => {
  const { signer, network } = useWallet();
  const contracts = useContractsState(
    useCallback((state) => state.contracts, []),
    shallow
  );
  const setContracts = useContractsState((state) => state.setContracts);
  useEffect(() => {
    if (signer) {
      if (network !== process.env.NEXT_PUBLIC_NETWORK_SUPPORTED) {
        setContracts({});
      } else {
        loadContracts(signer, setContracts);
      }
    }
  }, [signer, network, setContracts]);

  return contracts;
};
