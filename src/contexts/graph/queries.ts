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
      balances(
        where: {value_gt: 0}) {
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
      tokenID
      lendAmount
      lenderAddress
      maxRentDuration
      dailyRentPrice
      paymentToken
      is721
      rentClaimed
      renting {
        id
        renterAddress
        rentDuration
        rentedAt
        expired
      }
    }
  }
`;

export const queryUserLendingRenft = (user: string): string => {
  return `{
    users(where: {id: "${user.toString().toLowerCase()}"}) {
      lending {
        id
        nftAddress
        tokenID
        lendAmount
        dailyRentPrice
        paymentToken
        lenderAddress
        maxRentDuration
        is721
        rentClaimed
        renting {
          id
          renterAddress
          rentDuration
          rentedAt
          expired
        }
      }
    }
  }`;
};

export const queryUserRentingRenft = (user: string): string => {
  return `{
    users(where: {id: "${user.toString().toLowerCase()}"}) {
      renting {
        id
        renterAddress
        rentDuration
        rentedAt
        expired
        lending {
          id
          nftAddress
          tokenID
          lendAmount
          dailyRentPrice
          paymentToken
          lenderAddress
          maxRentDuration
          is721
          rentClaimed
        }
      }
    }
  }`;
};
