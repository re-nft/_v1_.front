import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { AbiItem } from "web3-utils";
import { Contract } from "web3-eth-contract";

import DappContext from "./Dapp";
import { Address, PaymentToken } from "../types";
import { MAX_UINT256 } from "../constants";
import { THROWS } from "../utils";
import Web3 from "web3";
import addresses from "contracts/addresses";

type ContractsContextType = {
  helpers: {
    getOpenSeaNfts: () => void;
    setExternalNfts: () => void;
    getExternalNfts: () => void;
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
    isApproved: (tokenId: string) => Promise<boolean>;
    approve: (tokenId: string) => void;
    approveAll: () => void;
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
  helpers: {
    getOpenSeaNfts: THROWS,
    setExternalNfts: THROWS,
    getExternalNfts: THROWS,
  },
  erc20: {
    approve: THROWS,
  },
  erc721: {
    approve: THROWS,
  },
  face: {
    isApproved: async () => {
      console.error("must be implemented");
      return false;
    },
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
  const { web3, wallet, addresses, abis } = useContext(DappContext);
  const [face, setFace] = useState<Contract>();
  const [rent, setRent] = useState<Contract>();

  const getContract = useCallback(
    (abi: AbiItem, address: Address): Contract | undefined => {
      if (!web3) return;
      const contract = new web3.eth.Contract(abi, address);
      return contract;
    },
    [web3]
  );

  const getRentContract = useCallback(async () => {
    if (!abis?.rent || !addresses?.rent) return;

    const contract = getContract(abis.rent, addresses.rent);
    if (!contract) return;

    setRent(contract);
  }, [getContract, abis?.rent, addresses?.rent]);

  // --------------------------- Face -------------------------------
  const getFaceContract = useCallback(async () => {
    if (!abis?.face || !addresses?.face) return;

    const contract = getContract(abis.face, addresses.face);
    if (!contract) return;

    setFace(contract);
  }, [getContract, addresses?.face, abis?.face]);

  const approveAllFace = useCallback(async () => {
    if (!web3 || !wallet?.account || !addresses?.rent || !face?.methods) return;
    await face?.methods
      .setApprovalForAll(addresses?.rent, true)
      .send({ from: wallet?.account });
  }, [face, web3, wallet?.account, addresses?.rent]);

  const approveFace = useCallback(
    async (tokenId: string) => {
      if (!web3 || !wallet?.account || !addresses?.rent || !face?.methods)
        return;
      await face?.methods
        .approve(addresses?.rent, tokenId)
        .send({ from: wallet?.account });
    },
    [face, web3, wallet?.account, addresses?.rent]
  );

  const _isApprovedFace = useCallback(
    async (tokenId: string) => {
      const account = await face?.methods.getApproved(tokenId).call();
      return account.toLowerCase() === addresses?.rent.toLowerCase();
    },
    [face, addresses?.rent]
  );

  const isApprovedFace = useCallback(
    async (tokenId: string) => {
      let itIs = await face?.methods
        .isApprovedForAll(wallet?.account, addresses?.rent)
        .call();
      if (itIs) return true;
      itIs = await _isApprovedFace(tokenId);
      return itIs;
    },
    [face?.methods, wallet?.account, addresses?.rent, _isApprovedFace]
  );
  // ----------------------------------------------------------------

  // rent one NFT
  const rentOne = useCallback(
    async (tokenId: string, rentDuration: string) => {
      // ! TODO: change for the address of the NFT
      // await rent?.methods
      //   .rentOne(
      //     wallet?.account,
      //     addresses.goerli.face,
      //     web3?.utils.hexToNumberString(tokenId),
      //     rentDuration
      //   )
      //   .send({ from: wallet?.account });
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
      // await rent?.methods
      //   .lendOne(
      //     addresses.goerli.face,
      //     tokenId,
      //     maxDuration,
      //     borrowPrice,
      //     nftPrice
      //   )
      //   .send({ from: wallet?.account });
    },
    [wallet?.account, rent, dappOk]
  );

  const returnOne = useCallback(
    async (nftAddress: string, tokenId: string) => {
      await rent?.methods
        .returnNftOne(nftAddress, tokenId)
        .send({ from: wallet?.account });
    },
    [dappOk, wallet?.account, rent]
  );

  // ---------------------------------------------------------------

  const getAllContracts = useCallback(async () => {
    await Promise.all([getFaceContract(), getRentContract()]);
    // * all contracts should be re-fetched when network or an account change
  }, [getFaceContract, getRentContract]);

  useEffect(() => {
    getAllContracts();
  }, [getAllContracts, wallet?.networkName, wallet?.account]);

  return (
    <ContractsContext.Provider
      value={{
        face: {
          contract: face,
          isApproved: isApprovedFace,
          approve: approveFace,
          approveAll: approveAllFace,
        },
        erc20: {
          // * may fail if the transaction amount is higher than allowance
          isApproved: isApprovedErc20,
          approve: approveErc20,
        },
        erc721: {
          isApproved: isApprovedErc721,
          approve: approveErc721,
        },
        rent: {
          contract: rent,
          lendOne,
          lendMultiple,
          rentOne,
          rentMultiple,
          returnOne,
          returnMultiple,
          stopLednginOne,
          stopLendingMultiple,
          claimCollateralOne,
          claimCollateralMultiple,
        },
      }}
    >
      {children}
    </ContractsContext.Provider>
  );
};

export default ContractsContext;
