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
  pmtToken: {
    dai: {
      contract?: Contract;
      approve: () => void;
    };
  };
  face: {
    contract?: Contract;
    approveOfAllFaces: () => void;
  };
  rent: {
    contract?: Contract;
    lendOne: (
      tokenId: string,
      maxDuration: string,
      borrowPrice: string,
      nftPrice: string
    ) => void;
    rentOne: (tokenId: string, rentDuration: string) => void;
  };
};

const DefaultContractsContext = {
  pmtToken: {
    dai: {
      approve: () => {
        throw new Error("must be implemented");
      },
    },
  },
  face: {
    approveOfAllFaces: () => {
      throw new Error("must be implemented");
    },
  },
  rent: {
    lendOne: () => {
      throw new Error("must be implemented");
    },
    rentOne: () => {
      throw new Error("must be implemented");
    },
  },
};

const ContractsContext = createContext<ContractsContextType>(
  DefaultContractsContext
);

// ! 1bn (18 d.p.)
const UNLIMITED_ALLOWANCE = "1000000000000000000000000000";

type ContractsProviderProps = {
  children: React.ReactNode;
};

export const ContractsProvider: React.FC<ContractsProviderProps> = ({
  children,
}) => {
  const { web3, wallet } = useContext(DappContext);
  const [face, setFace] = useState<Contract>();
  const [rent, setRent] = useState<Contract>();
  const [dai, setDai] = useState<Contract>();

  const getDaiContract = useCallback(async () => {
    if (dai != null || web3 == null) {
      return;
    }
    const contract = new web3.eth.Contract(
      abis.erc20.abi,
      addresses.goerli.dai
    );
    setDai(contract);
  }, [web3, dai]);

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
    getDaiContract();
  }, [web3, getFaceContract, getRentContract, getDaiContract]);

  // TODO: get graph field for all approvals for checkz. and make a bool field somewhere
  const approveOfAllFaces = useCallback(async () => {
    if (face == null || wallet == null || !wallet.account) {
      console.debug("need face and web3 and wallet to approve all");
      return;
    }
    await face.methods
      .setApprovalForAll(addresses.goerli.rent, true)
      .send({ from: wallet.account });
  }, [face, wallet]);

  const approveDai = useCallback(async () => {
    if (dai == null || wallet == null || !wallet.account) {
      console.debug("no dai contract");
      return;
    }
    await dai.methods
      .approve(addresses.goerli.rent, UNLIMITED_ALLOWANCE)
      .send({ from: wallet.account });
  }, [wallet, dai]);

  const rentOne = useCallback(
    async (tokenId: string, rentDuration: string) => {
      if (rent == null || wallet == null) {
        return;
      }
      // ! TODO: change for the address of the NFT
      await rent.methods
        .rentOne(wallet.account, addresses.goerli.face, tokenId, rentDuration)
        .send({ from: wallet.account });
    },
    [rent, wallet]
  );

  const lendOne = useCallback(
    async (
      tokenId: string,
      maxDuration: string,
      borrowPrice: string,
      nftPrice: string
    ) => {
      if (rent == null || web3 == null || wallet == null || !wallet.account) {
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
        pmtToken: {
          dai: {
            contract: dai,
            approve: approveDai,
          },
        },
        face: { contract: face, approveOfAllFaces },
        rent: { contract: rent, lendOne, rentOne },
      }}
    >
      {children}
    </ContractsContext.Provider>
  );
};

export default ContractsContext;
