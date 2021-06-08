import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import usePoller from "../hooks/usePoller";
import { ProviderContext } from "../hardhat/SymfoniContext";
import { Block } from "@ethersproject/abstract-provider";
import createDebugger from "debug";
import createCancellablePromise from "../contexts/create-cancellable-promise";

const debug = createDebugger("app:contracts:blocks");

export const TimestampContext = createContext<number>(0);

TimestampContext.displayName = "TimestampContext";


const day = 24 * 60 * 60 * 1000;

export const TimestampProvider: React.FC = ({ children }) => {
  const [provider] = useContext(ProviderContext);
  const [timeStamp, setTimestamp] = useState(Date.now() - day);

  const getTimestamp = useCallback(() => {
    if (provider) {
      const request = createCancellablePromise(provider.getBlock('latest'));
      request.promise
        .then((block: Block) => {
          if (timeStamp !== block.timestamp * 1000)
            setTimestamp(block.timestamp * 1000);
        })
        .catch((e) => {
          if (e) debug(e);
        });
      return request.cancel;  
    }
    return;
  }, [provider, timeStamp]);

  useEffect(() => {
    const cancel = getTimestamp();
    ()=>{
      if(cancel) cancel();
    }
  }, [getTimestamp, timeStamp]);

  // this will cause a lot of rerender, do not setit for too low value
  usePoller(() => {
    getTimestamp();
  }, 30_000);

  return (
    <TimestampContext.Provider
      value={timeStamp}
    >
      {children}
    </TimestampContext.Provider>
  );

};
