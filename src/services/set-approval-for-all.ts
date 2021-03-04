import { RentNft } from "../hardhat/typechain/RentNft";
import { ERC721 } from "../hardhat/typechain/ERC721";
import { ERC1155 } from "../hardhat/typechain/ERC1155";
import { ContractTransaction } from "ethers";

export default async function setApprovalForAll(
    renft: RentNft,
    contract: ERC721 | ERC1155,
): Promise<ContractTransaction> {
    const result = await contract.setApprovalForAll(renft.address, true);
    return result;
}
