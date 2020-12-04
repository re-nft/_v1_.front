import React, {
  useCallback,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import { Box, Tooltip } from "@material-ui/core";

import Contracts from "../contexts/Contracts";
import { Lending, PaymentToken } from "../types";
import RentModal from "./RentModal";
import GraphContext from "../contexts/Graph";
import DappContext from "../contexts/Dapp";

type RentCatalogueProps = {
  iBorrow: boolean;
  setCold: (cold: boolean) => void;
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

const RentCatalogue: React.FC<RentCatalogueProps> = ({ iBorrow, setCold }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [lending, setLending] = useState<Lending>();
  const [myData, setMyData] = useState<Lending[]>([]);
  const { wallet, addresses } = useContext(DappContext);
  const { rent, erc721 } = useContext(Contracts);
  const { lending: allLendings, user } = useContext(GraphContext);

  const _setMyData = useCallback(() => {
    if (!wallet || !wallet?.account) return;
    let resolvedData: Lending[] = [];
    resolvedData = iBorrow
      ? user.renting.map((r) => ({ ...r.lending }))
      : allLendings;
    if (resolvedData.length < 1) {
      setCold(true);
    } else {
      setCold(false);
    }
    setMyData(resolvedData);
  }, [allLendings, iBorrow, setCold, user.renting, wallet]);

  useEffect(() => {
    _setMyData();
  }, [_setMyData]);

  // we filter out the nfts that the user is either lending or renting
  const usersNfts = useMemo(() => {
    const userLending = user.lending.map((l) => l.id);
    const userRenting = user.renting.map((r) => r.lending.id);

    const _usersNfts = userLending.concat(userRenting);
    return _usersNfts;
  }, [user.lending, user.renting]);

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
        if (
          !rent?.returnOne ||
          !erc721?.isApproved ||
          !erc721?.approve ||
          !addresses?.rent
        )
          return;

        const isApproved = await erc721.isApproved(
          lending.nftAddress,
          addresses.rent,
          String(lending.tokenId)
        );

        if (!isApproved) {
          // approving for all the future NFTs coming from the lending.nftAddress
          await erc721.approve(lending.nftAddress, addresses.rent);
        }

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
    [rent, erc721, addresses?.rent]
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
            const id = `${lending.nftAddress}::${lending.tokenId}::${lending.id}`;

            if (!iBorrow) {
              if (usersNfts.includes(lending.id))
                return <React.Fragment key={id}></React.Fragment>;
            }

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
