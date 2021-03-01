import React, { useCallback, useState, useContext } from "react";
import { Box } from "@material-ui/core";
import { BigNumber } from "ethers";

import { useRenft } from "../../hooks/useRenft";
import {
  CurrentAddressContext,
  RentNftContext,
  SignerContext,
  ResolverContext,
  // todo: remove for prod
  MyERC20Context,
} from "../../hardhat/SymfoniContext";
import { RentButton } from "./RentButton";
import NumericField from "../NumericField";
import { RentModal } from "../RentModal";
import { PaymentToken } from "../../types";
import { NftAndLendingId } from "../../contexts/Graph/types";
import { getERC20 } from "../../utils";
import { MAX_UINT256 } from "../../consts";
import CatalogueItem from "../CatalogueItem";

export const AvailableToRent: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNft, setSelectedNft] = useState<NftAndLendingId>();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const { allRentings } = useRenft();
  const [currentAddress] = useContext(CurrentAddressContext);
  const { instance: renft } = useContext(RentNftContext);
  const [signer] = useContext(SignerContext);
  const { instance: resolver } = useContext(ResolverContext);
  const { instance: myERC20 } = useContext(MyERC20Context);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleModalOpen = useCallback(
    (nft: NftAndLendingId) => {
      setSelectedNft(nft);
      setModalOpen(true);
    },
    [setSelectedNft, setModalOpen]
  );

  const handleRent = useCallback(
    async (
      nft: NftAndLendingId,
      { rentDuration }: { rentDuration: string }
    ) => {
      // todo: myERC20 to be removed in prod
      if (
        !currentAddress ||
        !renft ||
        !nft.contract?.address ||
        !signer ||
        !resolver ||
        !myERC20
      )
        return;

      // this means user is renting for a day. This is selectable by user
      // fetch payment token from lending
      const pmtToken = PaymentToken.DAI;
      // fetch dailyRentPrice from lending
      const dailyRentPrice = 1_000;
      // fetch collateral from lending
      const collateral = 1_000;
      const amountPayable = Number(rentDuration) * dailyRentPrice + collateral;
      //@ts-ignore
      const isETHPayment = pmtToken === PaymentToken.ETH;

      if (isETHPayment) {
        // ! will only ever fail if the user does not have enough ETH
        // ! or the arguments here are incorrect (e.g. rentDuration exceeds maxRentDuration)
        await renft.rent(
          [nft.contract?.address],
          [nft.tokenId],
          [nft.lendingId],
          [rentDuration],
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
        const notEnough = BigNumber.from(amountPayable).gt(allowance);
        if (notEnough) {
          await erc20.approve(renft.address, MAX_UINT256);
        }

        await renft.rent(
          [nft.contract?.address],
          [nft.tokenId],
          [nft.lendingId],
          [rentDuration]
        );
      }
    },
    [renft, currentAddress, signer, resolver]
  );

  const handleCheckboxChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const target = evt.target.name;
      const checked = evt.target.checked;
      setCheckedItems({
        ...checkedItems,
        [target]: checked,
      });
    },
    [checkedItems, setCheckedItems]
  );
  const countOfCheckedItems = Object.keys(checkedItems).length;

  return (
    <Box>
      {selectedNft && (
        <RentModal
          nft={selectedNft}
          open={modalOpen}
          onSubmit={handleRent}
          handleClose={handleModalClose}
        />
      )}
      <Box className="Catalogue">
        {allRentings.map((nft: NftAndLendingId) => {
          const id = `${nft.tokenId}`;
          const lending = nft.lendingRentInfo;

          return (
            <CatalogueItem
              key={id}
              tokenId={nft.tokenId}
              nftAddress={nft.contract?.address ?? ""}
              image={nft.image}
              onCheckboxChange={handleCheckboxChange}
            >
              <NumericField
                text="Daily price"
                value={String(lending.dailyRentPrice)}
                unit={PaymentToken[lending.paymentToken]}
              />
              <NumericField
                text="Max duration"
                value={String(lending.maxRentDuration)}
                unit="days"
              />
              <NumericField
                text="Collateral"
                value={String(lending.nftPrice)}
                unit={PaymentToken[lending.paymentToken]}
              />
              <div className="Nft__card">
                <RentButton handleRent={handleModalOpen} nft={nft} />
              </div>
            </CatalogueItem>
          );
        })}
      </Box>
      {countOfCheckedItems > 1 && (
        <div className="BatchRent">Batch Rent Now {countOfCheckedItems}</div>
      )}
    </Box>
  );
};

export default AvailableToRent;
