# Rent NFT

Welcome to ReNFT's humble abode, where magix happens!

![renft](https://user-images.githubusercontent.com/13678461/109494135-634a8800-7a85-11eb-9dd5-d07ca2865df1.png)

# Map
- [Go to develop section](#develop)

# Contributions
- Integrate Renting
  1. show all of the rentings (except your lendings) on the platform by default in the rent tab (erc721 and erc1155)
  2. just like in lending, add the toggle switch. When toggled, will only show the ones you are renting
  3. when you click rent under the available nft, shows modal. This modal will have inputs as per in the rent call in smart contract: number of days to rent for (cannot exceed maximum number set by lender), approve the nft (if required).
- Integrate Dashboard
  1. use the results from the subgraph calls already made to retrieve lendings and rentings for the tabs
- Leaderboard
  1. let's remove completely for now
