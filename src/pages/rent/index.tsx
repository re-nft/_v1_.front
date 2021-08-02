import React, { useContext } from "react";
import { AvailableToRent } from "../../components/pages/available-to-rent";
import { AvailableForRentContext } from "../../contexts/AvailableForRent";
import { useSearch } from "../../hooks/useSearch";


const AvailableToRentPage: React.FC = () => {
  const { allAvailableToRent, isLoading } = useContext(AvailableForRentContext);
  const items = useSearch(allAvailableToRent)
  return (
    <AvailableToRent
      isLoading={isLoading}
      allAvailableToRent={items}
    />
  );
};

export default AvailableToRentPage;
