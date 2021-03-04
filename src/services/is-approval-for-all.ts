import { RentNft } from "../hardhat/typechain/RentNft";
import { ERC721 } from "../hardhat/typechain/ERC721";
import { ERC1155 } from "../hardhat/typechain/ERC1155";

export default async function isApprovalForAll(
    renft: RentNft,
    contract: ERC721 | ERC1155,
    currentAddress: string
): Promise<boolean> {
    const isApproved = await contract.isApprovedForAll(
        currentAddress,
        renft.address
    );

    return isApproved;
}
