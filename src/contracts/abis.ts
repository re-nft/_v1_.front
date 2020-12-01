import { AbiItem } from "web3-utils";

import face from "./abis/goerli/GanFaceNft.json";
import rent from "./abis/goerli/RentNft.json";
import faucet from "./abis/goerli/Faucet.json";
import resolver from "./abis/goerli/Resolver.json";
import erc20 from "./abis/ERC20.json";
import erc721 from "./abis/ERC721.json";

import { NetworkSpecificAbis } from "./types";

type AbisType = {
  erc20: AbiItem;
  erc721: AbiItem;
  goerli: NetworkSpecificAbis;
};

const abis: AbisType = {
  erc20: erc20.abi,
  erc721: erc721.abi,
  goerli: {
    face: face.abi,
    rent: rent.abi,
    faucet: faucet.abi,
    resolver: resolver.abi,
  },
};

export default abis;
