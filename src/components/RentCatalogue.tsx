import React, { useCallback, useContext, useState, useMemo } from "react";
import { Box, Tooltip } from "@material-ui/core";

import Contracts from "../contexts/Contracts";
import { Lending } from "../types";
import RentModal from "./RentModal";
import GraphContext from "../contexts/Graph";
import DappContext from "../contexts/Dapp";

type RentCatalogueProps = {
  iBorrow: boolean;
};

type RentButtonProps = {
  handleRent: (lending: Lending) => void;
  lending: Lending;
};

type handleReturnArgs = {
  lending: Lending;
  gasSponsor?: string;
};
type handleReturnFunc = ({ lending, gasSponsor }: handleReturnArgs) => void;

type ReturnButtonProps = {
  handleReturn: handleReturnFunc;
  lending: Lending;
  gasSponsor?: handleReturnArgs["gasSponsor"];
};

type NumericFieldProps = {
  text: string;
  value: string;
  unit: string;
};

// ! this number conversion may fail if non-number is passed
// but since it comes out of blockchain, this should always be correct
const NumericField: React.FC<NumericFieldProps> = ({ text, value, unit }) => (
  <div className="Product__details">
    <p className="Product__text_overflow">
      <span className="Product__label">{text}</span>
      <Tooltip title={value}>
        <span className="Product__value">{`${unit} ${Number(value).toFixed(
          2
        )}`}</span>
      </Tooltip>
    </p>
  </div>
);

const RentButton: React.FC<RentButtonProps> = ({ handleRent, lending }) => {
  const handleClick = useCallback(() => {
    handleRent(lending);
  }, [handleRent, lending]);

  return (
    <span
      className="Product__buy"
      onClick={handleClick}
      style={{ marginTop: "8px" }}
    >
      Rent now
    </span>
  );
};

const ReturnButton: React.FC<ReturnButtonProps> = ({
  handleReturn,
  lending,
  gasSponsor,
}) => {
  const handleClick = useCallback(() => {
    handleReturn({ lending, gasSponsor });
  }, [lending, gasSponsor, handleReturn]);

  return (
    <span
      className="Product__buy"
      onClick={handleClick}
      style={{ marginTop: "8px" }}
    >
      Return now
    </span>
  );
};

const RentCatalogue: React.FC<RentCatalogueProps> = ({ iBorrow }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [lending, setLending] = useState<Lending>();
  const { wallet } = useContext(DappContext);
  const { rent } = useContext(Contracts);
  const { lending: allLendings, user } = useContext(GraphContext);
  const myRentings = user.renting;
  const myData: Lending[] = iBorrow
    ? myRentings.map((r) => ({ ...r.lending }))
    : allLendings;

  const userLendingIds = useMemo(() => {
    return user.lending.map((l) => l.id);
  }, [user.lending]);

  // todo: smack in the renting specific data here: (Lending & Omit<Renting, "lending">)[]
  // const nfts: Lending[] = useMemo(() => {
  //   if (iBorrow) {
  //     console.log(allLendings);
  //     return allLendings;
  //   } else {
  //     return user.renting.map((datum) => ({
  //       ...datum.lending,
  //     }));
  //   }
  // }, [allLendings, iBorrow, user.renting]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleRent = useCallback((_lending: Lending) => {
    setModalOpen(true);
    setLending(_lending);
  }, []);

  const handleReturn = useCallback(
    async ({
      lending,
      gasSponsor,
    }: {
      lending: Lending;
      gasSponsor?: string;
    }) => {
      try {
        if (!rent?.returnOne) return;
        await rent?.returnOne(
          lending.nftAddress,
          String(lending.tokenId),
          String(lending.id),
          gasSponsor
        );
      } catch (err) {
        console.debug("could not return the NFT");
      }
    },
    [rent]
  );

  // const fromWei = (v?: number): string =>
  //   v && web3 ? web3?.utils.fromWei(String(v), "ether") : "";

  return (
    <Box>
      {lending && (
        <RentModal
          open={modalOpen}
          handleClose={handleModalClose}
          lending={lending}
        />
      )}
      <Box className="Catalogue">
        {myData.length > 0 &&
          wallet?.status === "connected" &&
          myData.map((lending) => {
            // todo: poor time complexity, turn into sets for O(1) access
            // this line avoids showing the user currently lent NFT
            // this code will not show the user's rented NFT, because that gets
            // taken out of the currently available NFTs
            if (!iBorrow) {
              if (userLendingIds.includes(lending.id)) return <></>;
            }

            const id = `${lending.nftAddress}::${lending.tokenId}::${lending.id}`;

            return (
              <div className="Catalogue__item" key={id}>
                <div
                  className="Product"
                  data-item-id={id}
                  data-item-image={lending.imageUrl}
                >
                  <div className="Product__image">
                    <a href={lending.imageUrl}>
                      <img alt="nft" src={lending.imageUrl} />
                    </a>
                  </div>
                  <div className="Product__details">
                    <p className="Product__text_overflow">
                      <a
                        href={`https://goerli.etherscan.io/address/${lending.nftAddress}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "none", color: "black" }}
                      >
                        {lending.nftAddress}
                      </a>
                    </p>
                  </div>
                  <div className="Product__details">
                    <p className="Product__text_overflow">
                      <span className="Product__label">Token id</span>
                      <span className="Product__value">{lending.tokenId}</span>
                    </p>
                  </div>
                  <NumericField
                    text="Daily price"
                    value={String(lending.dailyRentPrice)}
                    unit="fDAI"
                  />
                  <NumericField
                    text="Max duration"
                    value={String(lending.maxRentDuration)}
                    unit="days"
                  />
                  <NumericField
                    text="Collateral"
                    value={String(lending.nftPrice)}
                    unit="fDAI"
                  />
                  <div className="Product__details">
                    {!iBorrow ? (
                      <RentButton handleRent={handleRent} lending={lending} />
                    ) : (
                      <ReturnButton
                        handleReturn={handleReturn}
                        lending={lending}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </Box>
    </Box>
  );
};

export default RentCatalogue;
