import { Nft } from "../contexts/graph/classes";

export default async function isApprovalForAll(
  nft: Nft[],
  currentAddress: string,
  contractAddress: string
): Promise<[boolean, Nft[]]> {
  const distinctItems = nft.filter(
    (item, index, all) =>
      all.findIndex((nft) => nft.address === item.address) === index
  );

  const result = await Promise.all(
    distinctItems.map((nft) => {
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
