import { Nft } from "../contexts/graph/classes";
import { getDistinctItems } from "../utils";

export default async function isApprovalForAll(
  nft: Nft[],
  currentAddress: string,
  contractAddress: string
): Promise<[boolean, Nft[]]> {

  const result = await Promise.all(
    getDistinctItems(nft, 'address').map((nft) => {
      const contract = nft.contract();
      return contract
        .isApprovedForAll(currentAddress, contractAddress)
        .then((isApproved) => {
          return [nft, isApproved, null];
        })
        .catch((e) => {
          return [nft, false, e];
        });
    })
  );
  const nonApproved = result
    .filter(([_, isApproved]) => !isApproved)
    .map(([nft]) => nft);
  return [nonApproved.length < 1, nonApproved];
}
