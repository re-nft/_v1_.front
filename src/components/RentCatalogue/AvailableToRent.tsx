import React, { useCallback, useState, useContext } from "react";
import { Box, Tooltip } from "@material-ui/core";
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
import { NftAndLendingId, PaymentToken } from "../../types";
import { getERC20 } from "../../utils";
import { MAX_UINT256 } from "../../consts";

type NumericFieldProps = {
  text: string;
  value: string;
  unit: string;
};

// ! this number conversion may fail if non-number is passed
// but since it comes out of blockchain, this should always be correct
const NumericField: React.FC<NumericFieldProps> = ({ text, value, unit }) => (
  <div className="Nft__card">
    <p className="Nft__text_overflow">
      <span className="Nft__label">{text}</span>
      <Tooltip title={value}>
        <span className="Nft__value">{`${unit} ${Number(value).toFixed(
          2
        )}`}</span>
      </Tooltip>
    </p>
  </div>
);

export const AvailableToRent: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { allRentings } = useRenft();
  const [currentAddress] = useContext(CurrentAddressContext);
  const { instance: renft } = useContext(RentNftContext);
  const [signer] = useContext(SignerContext);
  const { instance: resolver } = useContext(ResolverContext);
  const { instance: myERC20 } = useContext(MyERC20Context);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleRent = useCallback(
    async (nft: NftAndLendingId) => {
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
      // rentDuration must be <= nft.lendingRentInfo.maxRentDuration
      const rentDuration = 1;
      // fetch payment token from lending
      const pmtToken = PaymentToken.DAI;
      // fetch dailyRentPrice from lending
      const dailyRentPrice = 1_000;
      // fetch collateral from lending
      const collateral = 1_000;
      const amountPayable = rentDuration * dailyRentPrice + collateral;
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

  return (
    <Box>
      <Box className="Catalogue">
        {allRentings.map((nft: NftAndLendingId) => {
          const id = `${nft.tokenId}`;
          const lending = nft.lendingRentInfo;
          // const id = `${nft.contract?.address}::${nft.tokenId}`;
          return (
            <div className="Nft__item" key={id}>
              <div className="Nft" data-item-id={id}>
                <div className="Nft__image">
                  <a href={nft.image}>
                    <img alt="nft" src={nft.image} />
                  </a>
                </div>
                <div className="Nft__card">
                  <p className="Nft__text_overflow">
                    <a
                      href={`https://goerli.etherscan.io/address/${nft.contract?.address}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: "none", color: "black" }}
                    >
                      {nft.contract?.address}
                    </a>
                  </p>
                </div>
                <div className="Nft__card">
                  <p className="Nft__text_overflow">
                    <span className="Nft__label">Token id</span>
                    <span className="Nft__value">{nft.tokenId}</span>
                  </p>
                </div>
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
                  <RentButton handleRent={handleRent} nft={nft} />
                </div>
              </div>
            </div>
          );
        })}
      </Box>
    </Box>
  );
};

export default AvailableToRent;
