import { devtools as originalDevTools, NamedSet } from "zustand/middleware";
import {State, GetState, StoreApi} from 'zustand/vanilla'

//
export const devtools = <S extends State>(fn: (set: NamedSet<S>, get: GetState<S>, api: StoreApi<S>) => S, prefix?: string | undefined): (set: NamedSet<S>, get: GetState<S>, api: StoreApi<S>) => S => {
  if (process.env.NODE_ENV === "development") return originalDevTools(fn, prefix);
  return (set: NamedSet<S>, get: GetState<S>, api: StoreApi<S>): S => {
    return fn(set, get, api);
  };
};
