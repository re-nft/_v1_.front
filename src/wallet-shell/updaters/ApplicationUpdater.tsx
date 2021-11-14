import { useCallback, useContext, useEffect, useState } from "react";
import { useActiveWeb3React } from "../state-hooks";
import useDebounce from "../hooks/useDebounce";
import useIsWindowVisible from "../hooks/useIsWindowVisible";
import { Web3StatusActions } from "../index.provider";

// Updates blocknumber
export function ApplicationUpdater(): null {
  const { library, chainId } = useActiveWeb3React();
  const { updateBlockNumber } = useContext(Web3StatusActions);

  const windowVisible = useIsWindowVisible();

  const [state, setState] = useState<{
    chainId: number | undefined;
    blockNumber: number | null;
  }>({
    chainId,
    blockNumber: null,
  });

  const blockNumberCallback = useCallback(
    (blockNumber: number) => {
      setState((state) => {
        if (chainId === state.chainId) {
          if (typeof state.blockNumber !== "number")
            return { chainId, blockNumber };
          return {
            chainId,
            blockNumber: Math.max(blockNumber, state.blockNumber),
          };
        }
        return state;
      });
    },
    [chainId, setState]
  );

  // attach/detach listeners
  useEffect(() => {
    if (!library || !chainId || !windowVisible) return undefined;

    setState({ chainId, blockNumber: null });

    library
      .getBlockNumber()
      .then(blockNumberCallback)
      .catch((error: unknown) =>
        console.error(
          `Failed to get block number for chainId: ${chainId}`,
          error
        )
      );

    library.on("block", blockNumberCallback);
    return () => {
      library.removeListener("block", blockNumberCallback);
    };
  }, [chainId, library, blockNumberCallback, windowVisible]);

  const debouncedState = useDebounce(state, 100);

  useEffect(() => {
    if (
      !debouncedState.chainId ||
      !debouncedState.blockNumber ||
      !windowVisible
    )
      return;
    updateBlockNumber({
      chainId: debouncedState.chainId,
      blockNumber: debouncedState.blockNumber,
    });
  }, [
    windowVisible,
    debouncedState.blockNumber,
    debouncedState.chainId,
    updateBlockNumber,
  ]);

  return null;
}
