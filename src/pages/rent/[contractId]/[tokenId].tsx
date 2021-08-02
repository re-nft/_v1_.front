import { useRouter } from "next/router";
import React, { useContext, useMemo } from "react";
import { AvailableToRent } from "../../../components/pages/available-to-rent";
import { RentSwitchWrapper } from "../../../components/rent-switch-wrapper";
import { AvailableForRentContext } from "../../../contexts/AvailableForRent";

const AvailableToRentPage: React.FC = () => {
  const { allAvailableToRent, isLoading } = useContext(AvailableForRentContext);
  const {
    query: { contractId, tokenId }
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
        <div className="center content__message">
          That item isn&apos;t available for renting at the moment.
        </div>
      </RentSwitchWrapper>
    );
  return <AvailableToRent isLoading={isLoading} allAvailableToRent={all} />;
};

export default AvailableToRentPage;
