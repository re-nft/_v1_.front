import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { AvailableToRent } from "../../../components/pages/available-to-rent";
import { RentSwitchWrapper } from "../../../components/rent-switch-wrapper";
import { useAllAvailableForRent } from "../../../hooks/useAllAvailableForRent";
import Head from "next/head";
import { fetchNFTsFromOpenSea } from "../../../services/fetch-nft-meta";

const AvailableToRentPage: React.FC<{
  imageURL?: string;
  href?: string;
}> = ({ imageURL, href }) => {
  const { allAvailableToRent, isLoading } = useAllAvailableForRent();

  const {
    query: { contractId, tokenId },
  } = useRouter();

  const match = useMemo(() => {
    return allAvailableToRent.find((r) => {
      return r.tokenId === tokenId && r.address == contractId;
    });
  }, [contractId, tokenId, allAvailableToRent]);

  const all = useMemo(() => {
    return match ? [match] : [];
  }, [match]);

  if (!match && !isLoading)
    return (
      <RentSwitchWrapper>
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
        <div className="center content__message">
          That item isn&apos;t available for renting at the moment.
        </div>
      </RentSwitchWrapper>
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
export async function getServerSideProps({
  params: { contractId, tokenId },
  req,
}: any) {
  const meta = await fetchNFTsFromOpenSea([contractId], [tokenId]);
  const imageURL = meta ? meta[0]?.image : "";
  const href = new URL(req.url, `https://${req.headers.host}`).href;

  // Pass data to the page via props
  return { props: { imageURL, href } };
}

export default AvailableToRentPage;
