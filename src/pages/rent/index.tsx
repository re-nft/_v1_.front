import React from "react";
import { AvailableToRent } from "../../components/pages/available-to-rent";
import { useAllAvailableForRent } from "../../hooks/queries/useAllAvailableForRent";

const AvailableToRentPage: React.FC = () => {
  const { allAvailableToRent, isLoading } = useAllAvailableForRent();
  return <AvailableToRent isLoading={isLoading} allAvailableToRent={allAvailableToRent} />;
};

export default AvailableToRentPage;
