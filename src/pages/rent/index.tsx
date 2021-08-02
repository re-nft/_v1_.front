import React, { useContext } from "react";
import { AvailableToRent } from "../../components/pages/available-to-rent";
import { AvailableForRentContext } from "../../contexts/AvailableForRent";


const AvailableToRentPage: React.FC = () => {
  const { allAvailableToRent, isLoading } = useContext(AvailableForRentContext);
  return (
    <AvailableToRent
      isLoading={isLoading}
      allAvailableToRent={allAvailableToRent}
    />
  );
};

export default AvailableToRentPage;
