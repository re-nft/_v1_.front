import { ERC721 } from "../hardhat/typechain/ERC721";
import { ERC1155 } from "../hardhat/typechain/ERC1155";
import {
  TransactionStatus,
  useTransactionWrapper
} from "./useTransactionWrapper";
import { EMPTY, Observable } from "rxjs";

export function useSetApprovalAll(
  nfts: { address: string; contract: () => ERC721 | ERC1155 }[],
  contractAddress: string
): Observable<TransactionStatus> {
  const transactionWrapper = useTransactionWrapper();
  if (!contractAddress) return EMPTY;
  if (!nfts || nfts.length < 1) return EMPTY;
  const distinctItems = nfts.filter(
    (item, index, all) =>
      all.findIndex((nft) => nft.address === item.address) === index
  );
  if (distinctItems.length < 1) return EMPTY;
  return transactionWrapper(
    Promise.all(
      distinctItems.map((nft) => {
        const contract = nft.contract();
        return contract.setApprovalForAll(contractAddress, true);
      })
    )
  );
}
