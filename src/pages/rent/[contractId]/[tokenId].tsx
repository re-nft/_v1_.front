import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { AvailableToRent } from "../../../components/pages/available-to-rent";
import { RentSwitchWrapper } from "../../../components/rent-switch-wrapper";
import { useAllAvailableForRent } from "../../../hooks/useAllAvailableForRent";

const AvailableToRentPage: React.FC = () => {
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
        <div className="text-center text-lg text-white font-display py-32 leading-tight">
          That item isn&apos;t available for renting at the moment.
        </div>
      </RentSwitchWrapper>
    );
  return <AvailableToRent isLoading={isLoading} allAvailableToRent={all} />;
};

export default AvailableToRentPage;
