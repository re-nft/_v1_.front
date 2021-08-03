import React, { useContext } from "react";
import { AvailableToRent } from "../../components/pages/available-to-rent";
import { useAllAvailableForRent } from "../../hooks/useAllAvailableForRent";
import { useSearch } from "../../hooks/useSearch";


const AvailableToRentPage: React.FC = () => {
  const { allAvailableToRent, isLoading } = useAllAvailableForRent();
  const items = useSearch(allAvailableToRent)
  return (
    <AvailableToRent
      isLoading={isLoading}
      allAvailableToRent={items}
    />
  );
};

export default AvailableToRentPage;
