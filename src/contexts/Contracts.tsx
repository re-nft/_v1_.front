import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { Contract } from "web3-eth-contract";

import DappContext from "./Dapp";
import { abis, addresses } from "../contracts";

type ContractsContextType = {
  face: {
    contract?: Contract;
    approveOfAllFaces: () => void;
  };
  rent: {
    contract?: Contract;
    lendOne: (
      tokenId: number,
      maxDuration: number,
      borrowPrice: number,
      nftPrice: number
    ) => void;
  };
};

const DefaultContractsContext = {
  face: {
    approveOfAllFaces: () => {
      throw new Error("must be implemented");
    },
  },
  rent: {
    lendOne: () => {
      throw new Error("must be implemented");
    },
  },
};

const ContractsContext = createContext<ContractsContextType>(
  DefaultContractsContext
);

type ContractsProviderProps = {
  children: React.ReactNode;
};

export const ContractsProvider: React.FC<ContractsProviderProps> = ({
  children,
}) => {
  const { web3, wallet } = useContext(DappContext);
  const [face, setFace] = useState<Contract>();
  const [rent, setRent] = useState<Contract>();

  const getFaceContract = useCallback(async () => {
    if (face != null || web3 == null) {
      return;
    }
    const contract = new web3.eth.Contract(
      abis.goerli.face.abi,
      addresses.goerli.face
    );
    setFace(contract);
  }, [web3, face]);

  const getRentContract = useCallback(async () => {
    if (rent != null || web3 == null) {
      return;
    }
    const contract = new web3.eth.Contract(
      abis.goerli.rent.abi,
      addresses.goerli.rent
    );
    setRent(contract);
  }, [web3, rent]);

  useEffect(() => {
    if (web3 == null) {
      return;
    }
    getFaceContract();
    getRentContract();
  }, [web3, getFaceContract, getRentContract]);

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

  const lendOne = useCallback(
    async (tokenId, maxDuration, borrowPrice, nftPrice) => {
      if (rent == null || web3 == null || wallet == null) {
        console.debug("need face and web3 and wallet to approve all");
        return;
      }
      await rent.methods
        .lendOne(
          addresses.goerli.face,
          tokenId,
          maxDuration,
          borrowPrice,
          nftPrice
        )
        .send({ from: wallet.account });
    },
    [wallet, web3, rent]
  );

  return (
    <ContractsContext.Provider
      value={{
        face: { contract: face, approveOfAllFaces },
        rent: { contract: rent, lendOne },
      }}
    >
      {children}
    </ContractsContext.Provider>
  );
};

export default ContractsContext;
