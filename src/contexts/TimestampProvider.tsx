import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { Block } from "@ethersproject/abstract-provider";
import createDebugger from "debug";
import UserContext from "./UserProvider";
import { EMPTY, from, map, mergeMap, timer } from "rxjs";
import { SECOND_IN_MILLISECONDS } from "../consts";

const debug = createDebugger("app:contracts:blocks");

export const TimestampContext = createContext<number>(0);

TimestampContext.displayName = "TimestampContext";

const day = 24 * 60 * 60 * 1000;

export const TimestampProvider: React.FC = ({ children }) => {
  const { web3Provider: provider } = useContext(UserContext);
  const [timeStamp, setTimestamp] = useState(Date.now() - day);

  const getTimestamp = useCallback(() => {
    if (provider) {
      return from(
        provider.getBlock("latest").catch((e) => {
          if (e) debug(e);
        })
      ).pipe(
        map((block: Block | void) => {
          if (!block) return;
          return block.timestamp * 1000;
        })
      );
    }
    return EMPTY;
  }, [provider, timeStamp]);

  useEffect(() => {
    const cancel = getTimestamp().subscribe((timestamp) => {
      if (timestamp) setTimestamp(timestamp);
    });
    () => {
      if (cancel) cancel.unsubscribe();
    };
  }, [getTimestamp, timeStamp]);

  useEffect(() => {
    const subscription = timer(0, 30 * SECOND_IN_MILLISECONDS)
      .pipe(mergeMap(() => getTimestamp()))
      .subscribe((timestamp) => {
        if (timestamp) setTimestamp(timestamp);
      });
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [getTimestamp]);

  return (
    <TimestampContext.Provider value={timeStamp}>
      {children}
    </TimestampContext.Provider>
  );
};
