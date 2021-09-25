import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { RentSearchLayout } from "../../../components/layouts/rent-search-layout";
import { useAllAvailableForRent } from "../../../hooks/queries/useAllAvailableForRent";
import Head from "next/head";
import { fetchNFTsFromOpenSea } from "../../../services/fetch-nft-meta";
import { AvailableToRent } from "../../../components/pages/available-to-rent";
import { NftTokenMeta } from "../../../types";
import { GetServerSideProps } from "next";

const AvailableToRentPage: React.FC<{
  imageURL?: string;
  href?: string;
}> = ({ imageURL, href }) => {
  const { allAvailableToRent, isLoading } = useAllAvailableForRent();

  const {
    query: { contractId, tokenId }
  } = useRouter();

  const match = useMemo(() => {
    return allAvailableToRent.find((r) => {
      return r.tokenId === tokenId && r.nftAddress == contractId;
    });
  }, [contractId, tokenId, allAvailableToRent]);

  const all = useMemo(() => {
    return match ? [match] : [];
  }, [match]);

  if (!match && !isLoading)
    return (
      <RentSearchLayout>
        <div className="text-center text-base text-white font-display py-32 leading-tight">
          That item isn&apos;t available for renting at the moment.
        </div>
      </RentSearchLayout>
    );
  return (
    <>
      <Head>
        {imageURL && (
          <>
            <meta
              property="twitter:image"
              key="twitter:image"
              content={imageURL}
            />
            <meta property="og:image" key="og:image" content={imageURL} />
          </>
        )}
        {href && (
          <>
            <meta property="og:url" content={href} key="og:url" />
            <meta property="twitter:url" key="twitter:url" content={href} />
          </>
        )}
      </Head>

      <AvailableToRent isLoading={isLoading} allAvailableToRent={all} />
    </>
  );
};
// This gets called on every request
// this will bake metatags into every request to a shared url
export const getServerSideProps: GetServerSideProps = async ({
  params,
  req
}) => {
  if (Array.isArray(params)) {
    const metas: NftTokenMeta[] | undefined = await fetchNFTsFromOpenSea(
      [params.contractId as string],
      [params.tokenId as string]
    );
    const imageURL = metas && metas.length > 0 ? metas[0]?.image : "";
    const href = new URL(req?.url || "", `https://${req.headers.host}`).href;

    // Pass data to the page via props
    return { props: { imageURL, href } };
  }
  return { props: { imageURL: null, href: null } };
};

export default AvailableToRentPage;
