import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext
} from "react";
import { Contract } from "web3-eth-contract";

import DappContext from "./Dapp";
import { abis, addresses } from "../contracts";

type ContractsContextType = {
  face?: Contract;
  rent?: Contract;
  approveOfAllFaces: (event: React.SyntheticEvent) => void;
};

const DefaultContractsContext = {
  approveOfAllFaces: () => {
    throw new Error("must be implemented");
  }
};

const ContractsContext = createContext<ContractsContextType>(
  DefaultContractsContext
);

export const ContractsProvider: React.FC = ({ children }) => {
  const { web3, wallet } = useContext(DappContext);
  const [face, setFace] = useState<Contract>();
  const [rent, setRent] = useState<Contract>();

  const getFace = useCallback(async () => {
    if (face != null) {
      return;
    }
    const contract = new web3.eth.Contract(
      abis.goerli.face.abi,
      addresses.goerli.face
    );
    setFace(contract);
  }, [web3]);

  const getRent = useCallback(async () => {
    if (rent != null) {
      return;
    }
    const contract = new web3.eth.Contract(
      abis.goerli.rent.abi,
      addresses.goerli.rent
    );
    setRent(contract);
  }, [web3]);

  useEffect(() => {
    if (web3 == null) {
      return;
    }
    getFace();
    getRent();
  }, [web3]);

  // TODO: get graph field for all approvals for checkz. and make a bool field somewhere
  const approveOfAllFaces = useCallback(async () => {
    if (face == null || web3 == null || wallet == null) {
      console.debug("need face and web3 and wallet to approve all");
      return;
    }
    await face.methods
      .setApprovalForAll(addresses.goerli.rent, true)
      .send({ from: wallet.account });
  }, [face, wallet, web3]);

  return (
    <ContractsContext.Provider value={{ face, rent, approveOfAllFaces }}>
      {children}
    </ContractsContext.Provider>
  );
};

export default ContractsContext;
