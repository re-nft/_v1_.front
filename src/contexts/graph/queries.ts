// non-reNFT's subgraph, with this query we pull all of user's
// ERC721 tokens (will work only in prod)
export const queryMyERC721s = (user: string, skip = 0): string => {
  return `{
    tokens(
      orderBy: mintTime, 
      orderDirection: desc, 
      first: 1000,
      skip: ${skip},
      where: {
        owner: "${user.toString().toLowerCase()}",
      }) {
      id
		  tokenURI
    }
  }`;
};

// non-reNFT's subgraph, with this query we pull all of user's
// ERC1155 tokens (will work only in prod)
export const queryMyERC1155s = (user: string, skip = 0): string => {
  return `{
    account(id: "${user.toString().toLowerCase()}",
        orderBy: id, 
        orderDirection: desc, 
        first: 1000,
        skip: ${skip}
        ) {
      ERC1155balances(
        where: {value_gt: 0}) {
        token {
          tokenURI: uri
          contract { contractAddress: id }
          tokenId: identifier
        }
        value
      }
    }
  }`;
};

export const queryAllLendingRenft = `
  {
    lendings(  first: 1000) {
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
      lentAt
      renting {
        id
        renterAddress
        rentDuration
        rentedAt
      }
    }
  }
`;

export const queryAllRentingRenft = `
  {
    rentings (  first: 1000) {
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
        lentAt
      }
    }
  }
`;

export const queryAllRenft = (): string => {
  return `{
    nfts {
      id
      lending(first:1000) {
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
        lentAt
        renting {
          id
          renterAddress
        }
      }
      renting(first:1000) {
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
    user(id: "${user.toString().toLowerCase()}") {
      id
      lending(first: 1000) {
        id
        nftAddress
        tokenId
        lentAmount
        isERC721
        collateralClaimed
        lentAt
        renting {
          id
        }
      }
      renting(first:1000) {
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
          collateralClaimed
        }
      }
    }
  }`;
};

export const queryUserLendingRenft = (user: string): string => {
  return `{
    users(where: {id: "${user.toString().toLowerCase()}"}) {
      lending(first: 1000) {
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
        collateralClaimed
        lentAt
        renting {
          id
          renterAddress
          rentDuration
          rentedAt
        }
      }
    }
  }`;
};

export const queryUserRentingRenft = (user: string): string => {
  return `{
    users(where: {id: "${user.toString().toLowerCase()}"}) {
      renting(first:1000) {
        id
        renterAddress
        rentDuration
        rentedAt
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
          collateralClaimed
        }
      }
    }
  }`;
};
