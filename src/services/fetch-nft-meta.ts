import { NftToken } from "../contexts/graph/types";
import { Nft } from "../contexts/graph/classes";
import { nftId } from "./firebase";
import fetch from "cross-fetch";
import {
  arrayToURI,
  buildStaticIPFS_URL,
  buildURI,
  matchIPFS_URL,
  normalizeTokenUri,
  snakeCaseToCamelCase,
} from "./utils";

export type NftMetaWithId = NftToken["meta"] & { id: string };
export type NftError = { id: string; error: string };

 export interface Asset {
  tokenId: string | null;
  tokenAddress: string;
  // schemaName?: WyvernSchemaName;
  // version?: TokenStandardVersion;
  name?: string;
  decimals?: number;
}

export interface OpenSeaFees {
  openseaSellerFeeBasisPoints: number;
  openseaBuyerFeeBasisPoints: number;
  devSellerFeeBasisPoints: number;
  devBuyerFeeBasisPoints: number;
}

/**
 * Annotated asset contract with OpenSea metadata
 */
 export interface OpenSeaAssetContract extends OpenSeaFees {
  name: string;
  address: string;
  // type: AssetContractType;
  // schemaName: WyvernSchemaName;
  sellerFeeBasisPoints: number;
  buyerFeeBasisPoints: number;
  description: string;
  tokenSymbol: string;
  imageUrl: string;
  // stats?: object;
  // traits?: object[];
  externalLink?: string;
  wikiLink?: string;
}

/**
 * Annotated asset spec with OpenSea metadata
 */
 export interface OpenSeaAsset extends Asset {
  assetContract: OpenSeaAssetContract;
  // collection: OpenSeaCollection;
  name: string;
  description: string;
  // owner: OpenSeaAccount;
  // orders: Order[] | null;
  // buyOrders: Order[] | null;
  // sellOrders: Order[] | null;
  isPresale: boolean;
  imageUrl: string;
  imagePreviewUrl: string;
  imageUrlOriginal: string;
  imageUrlThumbnail: string;
  openseaLink: string;
  externalLink: string;
  // traits: object[];
  numSales: number;
  // lastSale: AssetEvent | null;
  backgroundColor: string | null;
  // transferFee: BigNumber | string | null;
  // transferFeePaymentToken: OpenSeaFungibleToken | null;
}

async function fetchWithTimeout(
  resource: string,
  options: RequestInit & { timeout?: number }
) {
  const { timeout = 8000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
}

export const fetchNFTFromOtherSource = async (
  nft: Nft
): Promise<NftMetaWithId | NftError> => {
  const key = nftId(nft.address, nft.tokenId);
  const tokenURI = normalizeTokenUri(nft);

  if (nft._mediaURI) return { image: nft._mediaURI, id: key };
  if (!tokenURI) {
    return { id: key, error: "No tokenUri" };
  }

  // It's still possible that the tokenUri points to opensea...
  const headers: Record<string, string> = {};
  const transformedUri = buildURI(tokenURI);
  if (
    process.env.REACT_APP_OPENSEA_API &&
    transformedUri.indexOf("api.opensea") > -1
  ) {
    headers["X-API-KEY"] = process.env.REACT_APP_OPENSEA_API;
  }
  // We want timeout, as some resources are unfetchable
  // example : ipfs://bafybeifninkto2jwjp5szbkwawnnvl2bcpwo6os5zr45ctxns3dhtfxk7e/0.json
  return fetchWithTimeout(transformedUri, {
    headers,
  })
    .then((r) => r.json())
    // @ts-ignore
    .then((data) => {
      const imageIsIPFS_URL = matchIPFS_URL(data?.image);

      if (!imageIsIPFS_URL && data?.image?.startsWith("ipfs://ipfs/")) {
        console.warn(
          "is not IPFS URL, but we are downloading meta as if it is O_O",
          data
        );
        return { id: key, error: "non-ipfs url" };
      }
      const image = imageIsIPFS_URL
        ? buildStaticIPFS_URL(imageIsIPFS_URL)
        : data?.image;

      return {
        image: image,
        description: data?.description,
        name: data?.name,
        id: key,
      };
    })
    .catch(() => {
      return { id: key, error: "unknown error" };
    });
};

export const fetchNFTsFromOpenSea = async (
  asset_contract_addresses: Array<string>,
  token_ids: Array<string>
): Promise<Array<NftMetaWithId>> => {
  if (!process.env.REACT_APP_OPENSEA_API) {
    throw new Error("OPENSEA_API is not defined");
  }
  return fetch(
    `https://api.opensea.io/api/v1/assets/?${arrayToURI(
      "asset_contract_addresses",
      asset_contract_addresses
    )}&${arrayToURI("token_ids", token_ids)}&limit=50`,
    {
      headers: {
        "X-API-KEY": process.env.REACT_APP_OPENSEA_API,
      },
    }
  )
    .then((r) => r.json())
    .then((r) => {
      return r.assets.map(snakeCaseToCamelCase).map((nft: OpenSeaAsset) => {
        return {
          ...nft,
          image:
            nft.imagePreviewUrl ||
            nft.imageUrlThumbnail ||
            nft.imageUrl ||
            nft.imageUrlOriginal,
          id: nftId(nft.assetContract.address, nft.tokenId || ""),
        };
      });
    });
};
