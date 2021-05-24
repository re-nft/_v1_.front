import { useState, useContext, useEffect } from "react";
import { SignerContext } from "../../../hardhat/SymfoniContext";
import { fetchRenftsAll } from "../../../services/graph";
import { Nft, Renting } from "../classes";

export const useUserRenting = (): {
  userRenting: Renting[];
  isLoading: boolean;
} => {
  const [renting, setRentings] = useState<Renting[]>([]);
  const [signer] = useContext(SignerContext);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAndCreate = async () => {
      if (!signer) return;
      setLoading(true);
      const renftAll = await fetchRenftsAll(signer);
      setLoading(false);
      if (renftAll) {
        setRentings(Object.values(renftAll.renting) || []);
      }
    };
    fetchAndCreate();
  }, [signer]);

  return { userRenting: renting, isLoading };
};
