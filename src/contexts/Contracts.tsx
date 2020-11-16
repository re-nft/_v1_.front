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
    approveAll: () => void;
    approve: (tokenId: string) => void;
    isApproved: (tokenId: string) => Promise<string>;
    isApprovedAll: () => Promise<boolean>;
  };
  rent: {
    contract?: Contract;
    // TODO: lendOne and rentOne here need to take NFT address to generalise this
    lendOne: (
      tokenId: string,
      maxDuration: string,
      borrowPrice: string,
      nftPrice: string
    ) => void;
    rentOne: (tokenId: string, rentDuration: string) => void;
    returnOne: (nftAddress: string, tokenId: string) => void;
    claimCollateral: (nftAddress: string, tokenId: string) => void;
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
    approveAll: () => {
      throw new Error("must be implemented");
    },
    approve: () => {
      throw new Error("must be implemented");
    },
    isApproved: () => {
      throw new Error("must be implemented");
    },
    isApprovedAll: () => {
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
    returnOne: () => {
      throw new Error("must be implemented");
    },
    claimCollateral: () => {
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

  // checks that there is web3 and wallet
  // plus any additional args
  const dappOk = useCallback(
    (...args) => {
      if (!web3 || !wallet?.account) {
        console.debug("no web3 or wallet");
        return false;
      }
      for (const arg of args) {
        if (!arg) return false;
      }
      return true;
    },
    [web3, wallet]
  );

  const getDaiContract = useCallback(async () => {
    if (!dappOk()) return;
    if (dai != null) return;

    // todo: checkDapp as typeguard that web3 is not null
    const contract = new web3!.eth.Contract(
      abis.erc20.abi,
      addresses.goerli.dai
    );
    setDai(contract);
  }, [web3, dai, dappOk]);

  const getFaceContract = useCallback(async () => {
    if (!dappOk()) return;
    if (face != null) return;

    const contract = new web3!.eth.Contract(
      abis.goerli.face.abi,
      addresses.goerli.face
    );
    setFace(contract);
  }, [web3, face, dappOk]);

  const getRentContract = useCallback(async () => {
    if (!dappOk()) return;
    if (rent != null) return;

    const contract = new web3!.eth.Contract(
      abis.goerli.rent.abi,
      addresses.goerli.rent
    );
    setRent(contract);
  }, [web3, rent, dappOk]);

  const getAllContracts = useCallback(async () => {
    await Promise.all([getDaiContract(), getFaceContract(), getRentContract()]);
  }, [getDaiContract, getFaceContract, getRentContract]);

  useEffect(() => {
    getAllContracts();
  }, [getAllContracts]);

  // TODO: get graph field for all approvals for checkz. and make a bool field somewhere
  const approveAll = useCallback(async () => {
    if (!dappOk(face)) return;

    // todo: checkdapp typeguard against nulls
    await face?.methods
      .setApprovalForAll(addresses.goerli.rent, true)
      .send({ from: wallet?.account });
  }, [face, dappOk, wallet?.account]);

  const approve = useCallback(
    async (tokenId: string) => {
      if (!dappOk(face)) return;

      // todo: checkdapp typeguard against nulls
      await face?.methods
        .approve(addresses.goerli.rent, tokenId)
        .send({ from: wallet?.account });
    },
    [face, dappOk, wallet]
  );

  const isApproved = useCallback(
    async (tokenId: string) => {
      if (!dappOk(face)) return;

      // todo: checkdapp typeguard against nulls
      const account = await face?.methods.getApproved(tokenId).call();
      return account;
    },
    [face, dappOk, wallet]
  );

  const isApprovedAll = useCallback(async () => {
    if (!dappOk(face)) return;

    // todo: checkdapp typeguard against nulls
    const bool = await face?.methods
      .isApprovedForAll(wallet?.account, addresses.goerli.rent)
      .call();
    return bool;
  }, [face, dappOk, wallet]);

  // infinite approval of the payment token
  const approveDai = useCallback(async () => {
    if (!dappOk(dai)) return;

    await dai?.methods
      .approve(addresses.goerli.rent, UNLIMITED_ALLOWANCE)
      .send({ from: wallet?.account });
  }, [wallet?.account, dai, dappOk]);

  // ----------------- Contract Interaction -----------------------

  // rent one NFT
  const rentOne = useCallback(
    async (tokenId: string, rentDuration: string) => {
      if (!dappOk(rent)) return;

      // ! TODO: change for the address of the NFT
      await rent?.methods
        .rentOne(
          wallet?.account,
          addresses.goerli.face,
          web3?.utils.hexToNumberString(tokenId),
          rentDuration
        )
        .send({ from: wallet?.account });
    },
    [rent, wallet?.account, dappOk, web3]
  );

  // lend one NFT
  const lendOne = useCallback(
    async (
      tokenId: string,
      maxDuration: string,
      borrowPrice: string,
      nftPrice: string
    ) => {
      if (!dappOk(rent)) return;

      await rent?.methods
        .lendOne(
          addresses.goerli.face,
          tokenId,
          maxDuration,
          borrowPrice,
          nftPrice
        )
        .send({ from: wallet?.account });
    },
    [wallet?.account, rent, dappOk]
  );

  const returnOne = useCallback(
    async (nftAddress: string, tokenId: string) => {
      if (!dappOk(rent)) return;

      await rent?.methods
        .returnNftOne(nftAddress, tokenId)
        .send({ from: wallet?.account });
    },
    [dappOk, wallet?.account, rent]
  );

  const claimCollateral = useCallback(
    async (nftAddress: string, tokenId: string) => {
      if (!dappOk(rent)) return;

      await rent?.methods
        .claimCollateral(nftAddress, tokenId)
        .send({ from: wallet?.account });
    },
    [dappOk, wallet?.account, rent]
  );

  // ---------------------------------------------------------------

  return (
    <ContractsContext.Provider
      value={{
        pmtToken: {
          dai: {
            contract: dai,
            approve: approveDai,
          },
        },
        rent: { contract: rent, lendOne, rentOne, returnOne, claimCollateral },
        face: {
          contract: face,
          approveAll,
          approve,
          isApproved,
          isApprovedAll,
        },
      }}
    >
      {children}
    </ContractsContext.Provider>
  );
};

export default ContractsContext;
