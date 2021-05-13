// non-reNFT's subgraph, with this query we pull all of user's
// ERC721 tokens (will work only in prod)
export const queryMyERC721s = (user: string): string => {
  return `{
    tokens(where: {owner: "${user.toLowerCase()}"}) {
      id
		  tokenURI
    }
  }`;
};

// non-reNFT's subgraph, with this query we pull all of user's
// ERC1155 tokens (will work only in prod)
export const queryMyERC1155s = (user: string): string => {
  return `{
    account(id: "${user.toLowerCase()}") {
      balances(where: {value_gt: 0}) {
        token {
          tokenURI: URI
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

export const queryAllLendingRenft = `
  {
    lendings {
      id
      nftAddress
      tokenId
      lentAmount
      lenderAddress
      maxRentDuration
      dailyRentPrice
      nftPrice
      paymentToken
      collateralClaimed
      isERC721
    }
  }
`;

export const queryAllRentingRenft = `
  {
    rentings {
      id
      renterAddress
      rentDuration
      rentedAt
      lending {
        id
        nftAddress
        tokenId
        lentAmount
        lenderAddress
        maxRentDuration
        dailyRentPrice
        nftPrice
        paymentToken
        collateralClaimed
        isERC721
      }
    }
  }
`;

export const queryAllRenft = (): string => {
  return `{
    nfts {
      id
      lending {
        id
        nftAddress
        tokenId
        lentAmount
        lenderAddress
        maxRentDuration
        dailyRentPrice
        nftPrice
        paymentToken
        collateralClaimed
        isERC721
        renting {
          id
          renterAddress
        }
      }
      renting {
        id
        renterAddress
        rentDuration
        rentedAt
        lending {
          id
          nftAddress
          tokenId
          lentAmount
          lenderAddress
          maxRentDuration
          dailyRentPrice
          nftPrice
          paymentToken
          collateralClaimed
          isERC721
        }
      }
    }
  }`;
};

// reNFT's query to pull all user's lendings and rentings
export const queryUserRenft = (user: string): string => {
  return `{
    user(id: "${user.toLowerCase()}") {
      id
      lending {
        id
        nftAddress
        tokenId
        lentAmount
        isERC721
        renting {
          id
        }
      }
      renting {
        id
        renterAddress
        rentDuration
        rentedAt
        lending {
          id
          nftAddress
          tokenId
          lentAmount
          isERC721
        }
      }
    }
  }`;
};

export const queryUserLendingRenft = (user: string): string => {
  return `{
    users(where: {id: "${user.toLowerCase()}"}) {
      lending {
        id
        nftAddress
        tokenId
        lentAmount
        dailyRentPrice
        nftPrice
        paymentToken
        lenderAddress
        maxRentDuration
        isERC721
      }
    }
  }`;
};

export const queryUserRentingRenft = (user: string): string => {
  return `{
    user(where: {id: "${user.toLowerCase()}"}) {
      renting {
        renterAddress
        rentDuration
        rentedAt
        id
        lending {
          id
          nftAddress
          tokenId
          lentAmount
          dailyRentPrice
          nftPrice
          paymentToken
          lenderAddress
          maxRentDuration
          isERC721
        }
      }
    }
  }`;
};
