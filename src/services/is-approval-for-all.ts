import { RentNft } from "../hardhat/typechain/RentNft";
import {Nft} from '../contexts/graph/classes';

export default async function isApprovalForAll(
    renft: RentNft,
    nft: Nft[],
    currentAddress: string
): Promise<boolean> {
    const distinctItems = nft.filter((item, index, all) => 
        all.findIndex(nft => nft.address === item.address) === index
    );
    const result = await Promise.all(distinctItems.map(nft => {
        const contract = nft.contract();
        return contract.isApprovedForAll(currentAddress, renft.address);
    }));
    return result.every((isApproved) => isApproved);
}
