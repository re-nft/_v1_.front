import { ERC721 } from "../hardhat/typechain/ERC721";
import { ERC1155 } from "../hardhat/typechain/ERC1155";
import {
  TransactionStatus,
  useTransactionWrapper
} from "./useTransactionWrapper";
import { EMPTY, Observable } from "rxjs";

export function useSetApprovalAll(
  nfts: { address: string; contract: () => ERC721 | ERC1155 }[],
  currentAddress: string
): Observable<TransactionStatus> {
  const transactionWrapper = useTransactionWrapper();
  if (!currentAddress) return EMPTY;
  if (!nfts || nfts.length < 1) return EMPTY;
  const distinctItems = nfts.filter(
    (item, index, all) =>
      all.findIndex((nft) => nft.address === item.address) === index
  );
  if (distinctItems.length < 1) return EMPTY;
  console.log(nfts, currentAddress);
  return transactionWrapper(
    Promise.all(
      distinctItems.map((nft) => {
        const contract = nft.contract();
        return contract.setApprovalForAll(currentAddress, true);
      })
    )
  );
}
