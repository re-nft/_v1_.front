import request from "graphql-request";
import { useContext, useEffect, useState } from "react";
import { SignerContext } from "../../../hardhat/SymfoniContext";
import { CurrentAddressContextWrapper } from "../../CurrentAddressContextWrapper";
import { Lending, Renting } from "../classes";
import { queryUserLendingRenft } from "../queries";
import { LendingRaw } from "../types";
import { timeItAsync } from "../../../utils";

export const useUserLending = (): {
  userLending: Lending[];
  isLoading: boolean;
} => {
  const [currentAddress] = useContext(CurrentAddressContextWrapper);
  const [signer] = useContext(SignerContext);
  const [lending, setLendings] = useState<Lending[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAndCreate = async () => {
      if (!signer) return;
      if (!currentAddress) return;
      if (!process.env.REACT_APP_RENFT_API) {
        throw new Error("RENFT_API is not defined");
      }
      const subgraphURI = process.env.REACT_APP_RENFT_API;
      setLoading(true);
      const response: { users: { lending: LendingRaw[] }[] } =
        await timeItAsync(
          "Pulled Users ReNFT Lendings",
          async () =>
            await request(
              subgraphURI,
              queryUserLendingRenft(currentAddress)
            ).catch((e) => {
              return {};
            })
        );

      setLoading(false);
      if (response && response.users && response.users[0]) {
        const lendings = Object.values(response.users[0].lending)
          .filter((v) => v != null)
          .map((lending) => {
            return new Lending(lending, signer);
          });
        setLendings(lendings);
      }
    };
    fetchAndCreate();
  }, [signer, currentAddress]);

  return {
    userLending: lending,
    isLoading,
  };
};
