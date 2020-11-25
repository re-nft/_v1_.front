import face from "./abis/goerli/GanFaceNft.json";
import rent from "./abis/goerli/RentNft.json";
import faucet from "./abis/goerli/Faucet.json";
import resolver from "./abis/goerli/Resolver.json";
import erc20 from "./abis/IERC20.json";
import erc721 from "./abis/IERC721.json";

export const abis = {
  erc20,
  erc721,
  goerli: {
    face,
    rent,
    faucet,
    resolver,
  },
};
