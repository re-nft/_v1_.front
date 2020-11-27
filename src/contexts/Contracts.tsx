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
import { MAX_UINT256, ZERO_ADDRESS } from "../constants";
import { THROWS } from "../utils";

type ContractsContextType = {
  helpers: {
    getOpenSeaNfts: () => void;
    setExternalNfts: () => void;
    getExternalNfts: () => void;
  };
  // erc20: {
  //   contract?: Contract;
  //   approve: () => void;
  // };
  // erc721: {
  //   contract?: Contract;
  //   approve: () => void;
  // };
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
      nftAddress: Address,
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
      nftAddress: Address,
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
  // erc20: {
  //   approve: THROWS,
  // },
  // erc721: {
  //   approve: THROWS,
  // },
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

  // --------------------------- Rent -------------------------------
  const rentOne = useCallback(
    async (
      nftAddress: Address,
      tokenId: string,
      id: string,
      rentDuration: string,
      gasSponsor?: Address
    ) => {
      await rent?.methods
        .rentOne(
          nftAddress,
          tokenId,
          id,
          rentDuration,
          // ZERO_ADDRESS untested here
          gasSponsor || addresses?.rent || ZERO_ADDRESS
        )
        .send({ from: wallet?.account });
    },
    [rent, wallet?.account, addresses?.rent]
  );

  const rentMultiple = useCallback(
    async (
      nftAddresses: Address[],
      tokenIds: string[],
      ids: string[],
      rentDurations: string[],
      gasSponsors?: Address[]
    ) => {
      await rent?.methods
        .rentMultiple(
          nftAddresses,
          tokenIds,
          ids,
          rentDurations,
          gasSponsors ||
            Array(ids?.length).fill(addresses?.rent) ||
            Array(ids?.length).fill(ZERO_ADDRESS)
        )
        .send({ from: wallet?.account });
    },
    [rent, wallet?.account, addresses?.rent]
  );

  const lendOne = useCallback(
    async (
      nftAddress: Address,
      tokenId: string,
      maxRentDuration: string,
      dailyRentPrice: string,
      nftPrice: string,
      paymentToken: PaymentToken,
      gasSponsor?: Address
    ) => {
      await rent?.methods
        .lendOne(
          nftAddress,
          tokenId,
          maxRentDuration,
          dailyRentPrice,
          nftPrice,
          paymentToken,
          gasSponsor || addresses?.rent || ZERO_ADDRESS
        )
        .send({ from: wallet?.account });
    },
    [rent, wallet?.account, addresses?.rent]
  );

  const lendMultiple = useCallback(
    async (
      nftAddresses: Address[],
      tokenIds: string[],
      maxRentDurations: string[],
      dailyRentPrices: string[],
      nftPrices: string[],
      paymentTokens: PaymentToken[],
      gasSponsors?: Address[]
    ) => {
      await rent?.methods
        .lendMuliple(
          nftAddresses,
          tokenIds,
          maxRentDurations,
          dailyRentPrices,
          nftPrices,
          paymentTokens,
          gasSponsors ||
            Array(tokenIds?.length).fill(addresses?.rent) ||
            Array(tokenIds?.length).fill(ZERO_ADDRESS)
        )
        .send({ from: wallet?.account });
    },
    [wallet?.account, rent, addresses?.rent]
  );

  const returnOne = useCallback(
    async (
      nftAddress: Address,
      tokenId: string,
      id: string,
      gasSponsor?: Address
    ) => {
      await rent?.methods
        .returnOne(
          nftAddress,
          tokenId,
          id,
          gasSponsor || addresses?.rent || ZERO_ADDRESS
        )
        .send({ from: wallet?.account });
    },
    [wallet?.account, rent, addresses?.rent]
  );

  const returnMultiple = useCallback(
    async (
      nftAddresses: Address[],
      tokenIds: string[],
      ids: string[],
      gasSponsors?: Address[]
    ) => {
      await rent?.methods
        .returnMultiple(
          nftAddresses,
          tokenIds,
          ids,
          gasSponsors ||
            Array(tokenIds?.length).fill(addresses?.rent) ||
            Array(tokenIds?.length).fill(ZERO_ADDRESS)
        )
        .send({ from: wallet?.account });
    },
    [wallet?.account, rent, addresses?.rent]
  );

  const claimCollateralOne = useCallback(
    async (
      nftAddress: Address,
      tokenId: string,
      id: string,
      gasSponsor?: Address
    ) => {
      await rent?.methods
        .claimCollateralOne(
          nftAddress,
          tokenId,
          id,
          gasSponsor || addresses?.rent || ZERO_ADDRESS
        )
        .send({ from: wallet?.account });
    },
    [wallet?.account, rent, addresses?.rent]
  );

  const claimCollateralMultiple = useCallback(
    async (
      nftAddresses: Address[],
      tokenIds: string[],
      ids: string[],
      gasSponsors?: Address[]
    ) => {
      await rent?.methods
        .claimCollateralMultiple(
          nftAddresses,
          tokenIds,
          ids,
          gasSponsors ||
            Array(tokenIds?.length).fill(addresses?.rent) ||
            Array(tokenIds?.length).fill(ZERO_ADDRESS)
        )
        .send({ from: wallet?.account });
    },
    [wallet?.account, rent, addresses?.rent]
  );

  const stopLendingOne = useCallback(
    async (
      nftAddress: Address,
      tokenId: string,
      id: string,
      gasSponsor?: Address
    ) => {
      await rent?.methods
        .stopLendingOne(
          nftAddress,
          tokenId,
          id,
          gasSponsor || addresses?.rent || ZERO_ADDRESS
        )
        .send({ from: wallet?.account });
    },
    [wallet?.account, rent, addresses?.rent]
  );

  const stopLendingMultiple = useCallback(
    async (
      nftAddresses: Address[],
      tokenIds: string[],
      ids: string[],
      gasSponsors?: Address[]
    ) => {
      await rent?.methods
        .stopLendingMultiple(
          nftAddresses,
          tokenIds,
          ids,
          gasSponsors ||
            Array(tokenIds?.length).fill(addresses?.rent) ||
            Array(tokenIds?.length).fill(ZERO_ADDRESS)
        )
        .send({ from: wallet?.account });
    },
    [wallet?.account, rent, addresses?.rent]
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
        // erc20: {
        //   // * may fail if the transaction amount is higher than allowance
        //   isApproved: isApprovedErc20,
        //   approve: approveErc20,
        // },
        // erc721: {
        //   isApproved: isApprovedErc721,
        //   approve: approveErc721,
        // },
        rent: {
          contract: rent,
          lendOne,
          rentOne,
          rentMultiple,
          lendMultiple,
          returnOne,
          returnMultiple,
          stopLendingOne,
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
