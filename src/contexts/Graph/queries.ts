// non-reNFT's subgraph, with this query we pull all of user's
// ERC721 tokens (will work only in prod)
export const queryMyERC721s = (user: string): string => {
  // todo: change id to ${user.toLowerCase()}
  return `{
    tokens(where: {owner: "0x465dca9995d6c2a81a9be80fbced5a770dee3dae"}) {
      id
		  tokenURI
    }
  }`;
};

// non-reNFT's subgraph, with this query we pull all of user's
// ERC1155 tokens (will work only in prod)
export const queryMyERC1155s = (user: string): string => {
  // todo: change id to ${user.toLowerCase()}
  return `{
    account(id: "0x465dca9995d6c2a81a9be80fbced5a770dee3dae") {
      balances(where: {value_gt: 0}) {
        token {
          uri: URI
          registry {
            contractAddress: id
          }
          tokenId: identifier
        }
        value
      }
    }
  }`;
};

// reNFT's query to pull an array of nft-id unique
// items named lendingRentings
// if lendingRentings.lending.length ===
// lendingRentings.renting.length + 1, then the item
// has been rented by someone. It will be available
// to return by the renter, or to be claimed collateral
// on by the lender
// if renter did not return before rentedAt + rentDays
export const queryRenftAll = (): string => {
  return `{
    lendingRentings {
      lending {
        id
        nftAddress
        tokenId
        lenderAddress
        maxRentDuration
        dailyRentPrice
        nftPrice
        paymentToken
        collateralClaimed
      }
      renting {
        id
        renterAddress
        rentDuration
        rentedAt
      }
    }
  }`;
};

// reNFT's query to pull all lendings and rentings per user
export const queryRenftUser = (user: string): string => {
  return `{
    user(id: "${user.toLowerCase()}") {
      id
      lending {
        id
        nftAddress
        tokenId
        lenderAddress
        maxRentDuration
        dailyRentPrice
        nftPrice
        paymentToken
        renting {
          id
          renterAddress
          rentDuration
          rentedAt
        }
      }
      renting {
        id
        rentDuration
        rentedAt
        lending {
          id
          nftAddress
          tokenId
          lenderAddress
          maxRentDuration
          dailyRentPrice
          nftPrice
          paymentToken
          collateralClaimed
        }
      }
    }
  }`;
};
