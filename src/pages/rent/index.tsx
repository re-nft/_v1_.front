import React from "react";
import { AvailableToRent } from "renft-front/components/pages/available-to-rent";
import { useAllAvailableForRent } from "renft-front/hooks/queries/useAllAvailableForRent";

const AvailableToRentPage: React.FC = () => {
  const { allAvailableToRent, isLoading } = useAllAvailableForRent();
  return <AvailableToRent isLoading={isLoading} allAvailableToRent={allAvailableToRent} />;
};

export default AvailableToRentPage;
