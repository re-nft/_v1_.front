import { useEffect, useRef } from "react";

export const usePoller = (callback: CallableFunction, delay: number): void => {
  const savedCallback = useRef<CallableFunction>();
  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    function tick() {
      //@ts-ignore
      savedCallback.current();
    }
    const id = setInterval(tick, delay);
    return () => {
      clearInterval(id);
    };
  }, [callback, delay]);
};

export default usePoller;
