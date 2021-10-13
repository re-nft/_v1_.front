import { NftTokenMeta } from "../types";
import { Nft } from "../types/classes";
import {
  arrayToURI,
  buildStaticIPFS_URL,
  buildURI,
  matchIPFS_URL,
  normalizeTokenUri,
  snakeCaseToCamelCase,
} from "./utils";
import { getUniqueID } from "../utils";

export type NftError = { nId: string; error: string };

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
 * Annotated collection with OpenSea metadata
 */
export interface OpenSeaCollection extends OpenSeaFees {
  // Name of the collection
  name: string;
  // Slug, used in URL
  slug: string;
  // Accounts allowed to edit this collection
  editors: string[];
  // Whether this collection is hidden from the homepage
  hidden: boolean;
  // Whether this collection is featured
  featured: boolean;
  // Date collection was created
  createdDate: Date;

  // Description of the collection
  description: string;
  // Image for the collection
  imageUrl: string;
  // Image for the collection, large
  largeImageUrl: string;
  // Image for the collection when featured
  featuredImageUrl: string;
  // Object with stats about the collection
  //stats: object;
  // Data about displaying cards
  //displayData: object;
  // Tokens allowed for this collection
  // paymentTokens: OpenSeaFungibleToken[]
  // Address for dev fee payouts
  payoutAddress?: string;
  // Array of trait types for the collection
  // traitStats: OpenSeaTraitStats,
  // Link to the collection's main website
  externalLink?: string;
  // Link to the collection's wiki, if available
  wikiLink?: string;
}
/**
 * Annotated asset spec with OpenSea metadata
 */
export interface OpenSeaAsset extends Asset {
  assetContract: OpenSeaAssetContract;
  collection: OpenSeaCollection;
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
  permalink: string;
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
): Promise<NftTokenMeta | NftError> => {
  const key = getUniqueID(nft.nftAddress, nft.tokenId);
  const tokenURI = await normalizeTokenUri(nft);

  if (nft.mediaURI) return { image: nft.mediaURI, nId: key };
  if (!tokenURI) {
    return { nId: key, error: "No tokenUri" };
  }

  // It's still possible that the tokenUri points to opensea...
  const headers: Record<string, string> = {};
  const transformedUri = buildURI(tokenURI);
  if (
    process.env.NEXT_PUBLIC_OPENSEA_API &&
    transformedUri.indexOf("api.opensea") > -1
  ) {
    headers["X-API-KEY"] = process.env.NEXT_PUBLIC_OPENSEA_API;
  }
  // We want timeout, as some resources are unfetchable
  // example : ipfs://bafybeifninkto2jwjp5szbkwawnnvl2bcpwo6os5zr45ctxns3dhtfxk7e/0.json
  return (
    fetchWithTimeout(transformedUri, {
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
          return { nId: key, error: "non-ipfs url" };
        }
        const image = imageIsIPFS_URL
          ? buildStaticIPFS_URL(imageIsIPFS_URL)
          : data?.image;

        return {
          image: image,
          description: data?.description,
          name: data?.name,
          nId: key,
        };
      })
      .catch(() => {
        return { nId: key, error: "unknown error" };
      })
  );
};

export const fetchNFTsFromOpenSea = async (
  asset_contract_addresses: Array<string>,
  token_ids: Array<string>
): Promise<Array<NftTokenMeta>> => {
  if (!process.env.NEXT_PUBLIC_OPENSEA_API) {
    throw new Error("OPENSEA_API is not defined");
  }
  return fetch(
    `${process.env.NEXT_PUBLIC_OPENSEA_API}/?${arrayToURI(
      "asset_contract_addresses",
      asset_contract_addresses
    )}&${arrayToURI("token_ids", token_ids)}&limit=50`,
    {
      headers: {
        "X-API-KEY": process.env.NEXT_PUBLIC_OPENSEA_API_KEY,
      },
    }
  )
    .then((r) => r.json())
    .then((r) => {
      return r.assets.map(snakeCaseToCamelCase).map((nft: OpenSeaAsset) => {
        return {
          ...nft,
          openseaLink: nft.permalink,
          collection: {
            name: nft.collection?.name,
            description: nft.collection?.description,
            imageUrl: nft.collection?.imageUrl,
          },
          image:
            nft.imagePreviewUrl ||
            nft.imageUrlThumbnail ||
            nft.imageUrl ||
            nft.imageUrlOriginal,
          nId: getUniqueID(nft.assetContract.address, nft.tokenId || ""),
        };
      });
    })
    .catch((e) => {
      //TODO:eniko add sentry logging
      return [];
    });
};
