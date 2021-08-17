import { useRouter } from "next/router";
import React, { useMemo, useCallback, useEffect } from "react";
import { AvailableToRent } from "../../../components/pages/available-to-rent";
import { RentSwitchWrapper } from "../../../components/rent-switch-wrapper";
import { useAllAvailableForRent } from "../../../hooks/useAllAvailableForRent";
import Head from "next/head";
import { useFetchMeta, useNftMetaState } from "../../../hooks/useMetaState";
import shallow from "zustand/shallow";

const AvailableToRentPage: React.FC = () => {
  const { allAvailableToRent, isLoading } = useAllAvailableForRent();
  const fetchMeta = useFetchMeta();

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

  const imageURL = useNftMetaState(
    useCallback(
      (state) => {
        const id = all[0]?.nId;
        return id && state.metas ? state.metas[id]?.image : "";
      },
      [all]
    ),
    shallow
  );

  useEffect(() => {
    fetchMeta(all);
  }, [all, fetchMeta]);

  if (!match && !isLoading)
    return (
      <RentSwitchWrapper>
        <div className="center content__message">
          That item isn&apos;t available for renting at the moment.
        </div>
      </RentSwitchWrapper>
    );
  return (
    <>
      <Head>
        <meta property="twitter:image" key="twitter:image" content={imageURL} />
        <meta property="og:image" content={imageURL} key="og:image" />
      </Head>

      <AvailableToRent isLoading={isLoading} allAvailableToRent={all} />
    </>
  );
};

export default AvailableToRentPage;
