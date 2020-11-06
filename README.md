# Rent NFT

![website demo](https://gateway.pinata.cloud/ipfs/QmQ1VCsaXxZMSptNU3fBeDXEVyggGARj52NCmmnZFffsFP)

## TODOs

1 - most important
5 - least important

1. [1] Sometimes IPFS does not give all the faces (503 error) and we are left with some unloaded ones. Also, show the skeleton when image is loading (ask Naz)
2. [2] Don't let generating too many per day (browser cache solution is better than state, but still not great; we can assign credits per account, and they can only generate if they have credits; like loopbomb)
3. [3] Don't show the NFTs that do not have an image
4. [1] Generalise to work with ANY NFT
5. [1] Better UX / UI when minting. Say it is minting. What if it fails to mint? Show Try again
6. [2] Approve once and for all button show it only if the user hasn't approved before
7. [5] like minting NFTs in Gitcoin, give animation here
8. Do not show / fetch all the faces. Someone may have too many NFTs, do the background fetches and store in state and load as they press "Load More" / scroll down
9. [1] let approve individual ones
10. [5] authenticate users with their crypto wallet signature (can't remember why we need this)
11. [1] Make it responsive
12. [4] Can you make it mobile / non-crypto friendly?
13. [5] If GAN faces are in mainnet, add them to backlog for future batch mint
14. [1] Ability to take the NFT back into your posession (remove it from platform). I am thinking a "x" cross somewhere on the NFT
15. [3] Move to ethers.js before it is too late
16. [1] Add tooltip in the rent screen (for when the price is too low or too high, show what it actually is). Also add text overflow ellipsis if the price is too long
17. [1] support different stablecoins on the fe. There is no way to specify this right now
18. [4] Add payment token faucet for testnet people
19. [3] Upgrades persist the existing NFTs (thegraph. When we redeploy the graph, we must repoint it to the new rent and face addresses, this wipes clean all the previous faces
