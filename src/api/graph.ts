import Web3 from "web3";

export const ENDPOINT = "https://api.thegraph.com/subgraphs/name/nazariyv/rentnft";

const facesQuery = "";

export const nftsQuery = (): string => {
    return `{
        nfts {
          id
          address
          lender
          borrower
          face {
            uri
          }
      }}`
}

export const userQuery = (user: string, web3: Web3): string => {
    const hex = web3.utils.toHex(user);
    return `{
        user(id: "${hex}") {
        id
        lending {
          id
          address
          lender
          borrower
          maxDuration
          actualDuration
          borrowedAt
          borrowPrice
          nftPrice
          face {
            uri
          }
        }
        borrowing {
          id
          address
          lender
          borrower
          maxDuration
          actualDuration
          borrowedAt
          borrowPrice
          nftPrice
          face {
            uri
          }
        }
        faces {
          id
          uri
        }
        }
      }`;
};
