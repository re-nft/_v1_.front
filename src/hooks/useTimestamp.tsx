import { useCallback, useContext, useEffect, useState } from "react";
import { ProviderContext } from "../hardhat/SymfoniContext";
import { Block } from "@ethersproject/abstract-provider";
import createDebugger from "debug";
import usePoller from "./usePoller";

const debug = createDebugger("app:contracts:blocks");

const day = 24 * 60 * 60 * 1000;

export const useTimestamp = (): number => {
  const [provider] = useContext(ProviderContext);
  const [timeStamp, setTimestamp] = useState(Date.now() - day);

  const getTimestamp = useCallback(() => {
    if (provider) {
      return provider
        .getBlock("latest")
        .then((block: Block) => {
          if (timeStamp !== block.timestamp * 1000) setTimestamp(block.timestamp * 1000);
        })
        .catch((e) => {
          if (e) debug(e);
        });
    }
    return Promise.reject();
  }, [provider, timeStamp]);

  useEffect(() => {
    getTimestamp();
  }, [getTimestamp, timeStamp]);

  usePoller(() => {
    getTimestamp();
  }, 2000);

  return timeStamp;
};
