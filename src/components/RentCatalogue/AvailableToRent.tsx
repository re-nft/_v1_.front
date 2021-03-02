import React, { useCallback, useState, useContext, useMemo } from "react";
import { Box } from "@material-ui/core";
import { ethers } from "ethers";

import {
  CurrentAddressContext,
  RentNftContext,
  SignerContext,
  ResolverContext,
  // todo: remove for prod
  MyERC20Context,
} from "../../hardhat/SymfoniContext";
import { ERCNft } from "../../contexts/Graph/types";
import { RentButton } from "./RentButton";
import NumericField from "../NumericField";
import { PaymentToken } from "../../types";
import { getERC20 } from "../../utils";
import { MAX_UINT256 } from "../../consts";
import CatalogueItem from "../CatalogueItem";
import BatchRentModal from "./BatchRentModal";

export const AvailableToRent: React.FC = () => {
  const [isOpenBatchModel, setOpenBatchModel] = useState(false);
  const [checkedItems, setCheckedItems] = useState<ERCNft[]>([]);
  const [currentAddress] = useContext(CurrentAddressContext);
  const { instance: renft } = useContext(RentNftContext);
  const [signer] = useContext(SignerContext);
  const { instance: resolver } = useContext(ResolverContext);
  const { instance: myERC20 } = useContext(MyERC20Context);
  const allRentings: ERCNft[] = useMemo(() => [], []);

  const handleBatchModalClose = useCallback(() => {
    setOpenBatchModel(false);
  }, []);

  const handleBatchModalOpen = useCallback((nft: ERCNft) => {
    setCheckedItems([nft]);
    setOpenBatchModel(true);
  }, []);

  const handleRent = useCallback(
    async (nft: ERCNft[], { rentDuration }: { rentDuration: string[] }) => {
      // todo: myERC20 to be removed in prod
      if (
        nft.length === 0 ||
        !currentAddress ||
        !renft ||
        !signer ||
        !resolver ||
        !myERC20
      )
        return;

      const pmtToken = PaymentToken.DAI;
      const amountPayable = nft.reduce((sum, item, index) => {
        const dailyRentPrice = 0;
        const collateral = 0;
        const duration = Object.values(rentDuration);
        sum += Number(duration[index]) * dailyRentPrice + collateral;
        return sum;
      }, 0);
      //@ts-ignore
      const isETHPayment = pmtToken === PaymentToken.ETH;

      const addresses = nft.map((x) => x.contract?.address);
      const tokenIds = nft.map((x) => x.tokenId);
      const lendingIds = nft.map((x) => 0);
      const durations = Object.values(rentDuration).map((x) => Number(x));

      if (isETHPayment) {
        // ! will only ever fail if the user does not have enough ETH
        // ! or the arguments here are incorrect (e.g. rentDuration exceeds maxRentDuration)
        await renft.rent(
          // @ts-ignore
          addresses,
          tokenIds,
          lendingIds,
          durations,
          { value: amountPayable }
        );
      } else {
        const erc20Address = await resolver.getPaymentToken(pmtToken);
        if (!erc20Address) {
          console.warn("could not fetch address for payment token");
          return;
        }
        const erc20 = getERC20(erc20Address, signer);
        if (!erc20) {
          console.warn("could not fetch erc20 contract");
          return;
        }
        // check if reNFT contract is approved for the required amount to be spent
        const allowance = await erc20.allowance(currentAddress, renft.address);
        // TODO: fix amountPayable
        const notEnough = ethers.utils
          .parseEther(String(amountPayable))
          .gt(allowance);
        if (notEnough) {
          await erc20.approve(renft.address, MAX_UINT256);
        }

        await renft.rent(
          // @ts-ignore
          addresses,
          tokenIds,
          lendingIds,
          durations
        );
      }
    },
    [renft, currentAddress, signer, resolver, myERC20]
  );

  const handleCheckboxChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const target = evt.target.name;
      const sources: ERCNft[] = checkedItems.slice(0);
      const item = allRentings.find((nft) => nft.tokenId === target);
      const sourceIndex = checkedItems.findIndex(
        (nft) => nft.tokenId === target
      );
      if (sourceIndex === -1 && item) {
        sources.push(item);
        console.log(sources);
        setCheckedItems(sources);
      } else {
        sources.splice(sourceIndex, 1);
        setCheckedItems(sources);
      }
    },
    [checkedItems, setCheckedItems, allRentings]
  );

  const countOfCheckedItems = checkedItems.length;

  return (
    <Box>
      <BatchRentModal
        nft={checkedItems}
        open={isOpenBatchModel}
        onSubmit={handleRent}
        handleClose={handleBatchModalClose}
      />
      <Box className="Catalogue">
        {allRentings.map((nft: ERCNft) => {
          // TODO: get it
          const rentingId = -1;
          const id = `${nft.address}::${nft.tokenId}::${rentingId}`;

          return (
            <CatalogueItem
              key={id}
              tokenId={nft.tokenId}
              nftAddress={nft.contract?.address ?? ""}
              // TODO: name it meta
              image={nft.meta?.mediaURI}
              onCheckboxChange={handleCheckboxChange}
            >
              <NumericField
                text="Daily price"
                value={String(0)}
                unit={PaymentToken[PaymentToken.DAI]}
              />
              <NumericField text="Max duration" value={String(0)} unit="days" />
              <NumericField
                text="Collateral"
                value={String(0)}
                unit={PaymentToken[PaymentToken.DAI]}
              />
              <div className="Nft__card">
                <RentButton handleRent={handleBatchModalOpen} nft={nft} />
              </div>
            </CatalogueItem>
          );
        })}
      </Box>
      {}
    </Box>
  );
};

export default AvailableToRent;
