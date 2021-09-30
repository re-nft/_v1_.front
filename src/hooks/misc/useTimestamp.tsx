import { useEffect, useCallback } from "react";
import { Block } from "@ethersproject/abstract-provider";
import createDebugger from "debug";
import { EMPTY, from, map, mergeMap, timer } from "rxjs";
import { SECOND_IN_MILLISECONDS } from "../../consts";
import { useWallet } from "../store/useWallet";
import produce from "immer";
import create from "zustand";
import shallow from "zustand/shallow";

const debug = createDebugger("app:contracts:blocks");

const day = 24 * 60 * 60 * 1000;

const useTimestampState = create<{
  timestamp: number;
  setTimestamp: (r: number) => void;
}>((set) => ({
  timestamp: Date.now() - day,
  setTimestamp: (r: number) =>
    set(
      produce((state) => {
        state.timestamp = r;
      })
    ),
}));

export const useTimestamp = () => {
  const { web3Provider: provider } = useWallet();
  const timeStamp = useTimestampState(
    useCallback((state) => state.timestamp, []),
    shallow
  );
  const setTimestamp = useTimestampState((state) => state.setTimestamp);
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
  }, [provider]);

  useEffect(() => {
    const cancel = getTimestamp().subscribe((timestamp) => {
      if (timestamp) setTimestamp(timestamp);
    });
    () => {
      if (cancel) cancel.unsubscribe();
    };
  }, [getTimestamp, timeStamp, setTimestamp]);

  useEffect(() => {
    const subscription = timer(0, 30 * SECOND_IN_MILLISECONDS)
      .pipe(mergeMap(() => getTimestamp()))
      .subscribe((timestamp) => {
        if (timestamp) setTimestamp(timestamp);
      });
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [getTimestamp, setTimestamp]);

  return timeStamp;
};
