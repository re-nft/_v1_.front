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

export const queryMyMoonCats = (user: string): string => {
  return `{
    moonRescuers(where: { id: "${user.toLowerCase()}" }) {
      id,
      cats {
        id
      }
    }
  }`;
}

// non-reNFT's subgraph, with this query we pull all of user's
// ERC1155 tokens (will work only in prod)
export const queryMyERC1155s = (user: string): string => {
  // todo: change id to ${user.toLowerCase()}
  return `{
    account(id: "0x465dca9995d6c2a81a9be80fbced5a770dee3dae") {
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

export const queryAllRenft = (): string => {
  return `{
    nfts {
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

// reNFT's query to pull all user's lendings and rentings
export const queryUserRenft = (user: string): string => {
  return `{
    user(id: "${user.toLowerCase()}") {
      id
      lending {
        id
        nftAddress
        tokenId
        renting {
          id
        }
      }
      renting {
        id
        lending {
          id
          nftAddress
          tokenId
        }
      }
    }
  }`;
};

export const queryUserLendingRenft = (user: string): string => {
  return `{
    user(id: "${user.toLowerCase()}") {
      lending {
        id
      }
    }
  }`;
};

export const queryUserRentingRenft = (user: string): string => {
  return `{
    user(id: "${user.toLowerCase()}") {
      renting {
        id
      }
    }
  }`;
};
