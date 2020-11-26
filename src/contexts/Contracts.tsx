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
import { Address, Lending, PaymentToken } from "../types";
import { MAX_UINT256 } from "../constants";
import { THROWS } from "../utils";

type ContractsContextType = {
  helpers: {
    getOpenSeaNfts: () => Lending[];
    setExternalNfts: () => Promise<void>;
    getExternalNfts: () => Promise<void>;
  };
  erc20: {
    contract?: Contract;
    approve: () => void;
  };
  erc721: {
    contract?: Contract;
    approve: () => void;
  };
  face: {
    contract?: Contract;
    isApproved: (tokenId: string, whichOperator: Address) => Promise<boolean>;
    approve: (tokenId: string, operator: Address) => void;
    approveAll: (operator: Address) => void;
  };
  rent: {
    contract?: Contract;
    lendOne: (
      nftAddress: Address,
      tokenId: string,
      maxRentDuration: string,
      dailyRentPrice: string,
      nftPrice: string,
      paymentToken: PaymentToken,
      gasSponsor?: Address
    ) => void;
    lendMultiple: (
      nftAddresses: Address[],
      tokenIds: string[],
      maxRentDurations: string[],
      dailyRentPrices: string[],
      nftPrices: string[],
      paymentTokens: PaymentToken[],
      gasSponsors?: Address[]
    ) => void;
    rentOne: (
      nftAddress: Address,
      tokenId: string,
      lendingShortId: string,
      lendingLongId: string,
      rentDuration: string,
      gasSponsor?: Address
    ) => void;
    rentMultiple: (
      nftAddresses: Address[],
      tokenIds: string[],
      lendingShortIds: string[],
      lendingLongIds: string[],
      rentDurations: string[],
      gasSponsors?: Address[]
    ) => void;
    returnOne: (
      nftAddress: Address,
      tokenId: string,
      lendingShortId: string,
      lendingLongId: string,
      gasSponsor?: Address
    ) => void;
    returnMultiple: (
      nftAddresses: Address[],
      tokenIds: string[],
      lendingShortIds: string[],
      lendingLongIds: string[],
      gasSponsors?: Address[]
    ) => void;
    claimCollateralOne: (
      nftAddress: Address[],
      tokenId: string,
      lendingShortId: string,
      lendingLongId: string,
      gasSponsor?: Address
    ) => void;
    claimCollateralMultiple: (
      nftAddresses: Address[],
      tokenIds: string[],
      lendingShortIds: string[],
      lendingLongIds: string[],
      gasSponsors?: Address[]
    ) => void;
    stopLendingOne: (
      nftAddress: Address[],
      tokenId: string,
      lendingShortId: string,
      lendingLongId: string,
      gasSponsor?: Address
    ) => void;
    stopLendingMultiple: (
      nftAddresses: Address[],
      tokenIds: string[],
      lendingShortIds: string[],
      lendingLongIds: string[],
      gasSponsors?: Address[]
    ) => void;
  };
};

const DefaultContractsContext = {
  face: {
    isApproved: THROWS,
    approve: THROWS,
    approveAll: THROWS,
  },
  rent: {
    lendOne: THROWS,
    lendMultiple: THROWS,
    rentOne: THROWS,
    rentMultiple: THROWS,
    returnOne: THROWS,
    returnMultiple: THROWS,
    claimCollateralOne: THROWS,
    claimCollateralMultiple: THROWS,
    stopLendingOne: THROWS,
    stopLendingMultiple: THROWS,
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

  // const getDaiContract = useCallback(async () => {
  //   if (!dappOk()) return;
  //   if (dai != null) return;

  //   // todo: checkDapp as typeguard that web3 is not null
  //   const contract = new web3!.eth.Contract(
  //     abis.erc20.abi,
  //     addresses.goerli.dai
  //   );
  //   setDai(contract);
  // }, [web3, dai, dappOk]);

  const getFaceContract = useCallback(async () => {
    if (!dappOk()) return;
    if (face != null) return;

    const contract = new web3.eth.Contract(
      abis.goerli.face.abi,
      addresses.goerli.face
    );
    setFace(contract);
  }, [web3, face, dappOk]);

  const getRentContract = useCallback(async () => {
    if (!dappOk()) return;
    if (rent != null) return;

    const contract = new web3.eth.Contract(
      abis.goerli.rent.abi,
      addresses.goerli.rent
    );
    setRent(contract);
  }, [web3, rent, dappOk]);

  const getAllContracts = useCallback(async () => {
    await Promise.all([getFaceContract(), getRentContract()]);
  }, [getFaceContract, getRentContract]);

  useEffect(() => {
    getAllContracts();
  }, [getAllContracts]);

  const approveAll = useCallback(async () => {
    if (!dappOk(face)) return;

    // todo: checkdapp typeguard against nulls
    await face?.methods
      .setApprovalForAll(addresses.goerli.rent, true)
      .send({ from: wallet?.account });
  }, [face, dappOk, wallet?.account]);

  const approve = useCallback(
    async (nftAddress: string, tokenId: string, approveWho: Address) => {
      if (!dappOk(face)) return;

      // todo: checkdapp typeguard against nulls
      await face?.methods
        .approve(addresses.goerli.rent, tokenId)
        .send({ from: wallet?.account });
    },
    [face, dappOk, wallet]
  );

  const isApproved = useCallback(
    async (nftAddress: Address, tokenId: string) => {
      if (!dappOk(face)) return;

      // todo: checkdapp typeguard against nulls
      const account = await face?.methods.getApproved(tokenId).call();
      return account;
    },
    [face, dappOk]
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
  // const approveDai = useCallback(async () => {
  //   if (!dappOk(dai)) return;

  //   await dai?.methods
  //     .approve(addresses.goerli.rent, UNLIMITED_ALLOWANCE)
  //     .send({ from: wallet?.account });
  // }, [wallet?.account, dai, dappOk]);

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
        face: {
          contract: face,
          approveAll,
          approve,
          isApproved,
          isApprovedAll,
        },
        rent: { contract: rent, lendOne, rentOne, returnOne },
      }}
    >
      {children}
    </ContractsContext.Provider>
  );
};

export default ContractsContext;
