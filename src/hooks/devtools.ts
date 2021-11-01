import { devtools as originalDevTools } from "zustand/middleware";

export const devtools = (fn: (set, get, api) => unknown) => {
  if (process.env.NODE_ENV === "development") return originalDevTools(fn);
  return (set, get, api) => {
    return fn(set, get, api);
  };
};
