import { useCallback, useContext } from "react";
import { ContractContext } from "../contexts/ContractsProvider";
import createDebugger from "debug";

const debug = createDebugger("app:contracts:test");

export const useMint = () => {
  const { E721, E721B, E1155, E1155B, WETH, DAI, USDC, USDT, TUSD } =
    useContext(ContractContext);
  const mintE20 = useCallback(
    async (e20: number) => {
      switch (e20) {
        case 1:
          if (!WETH) return;
          await (await WETH.faucet()).wait();
          break;
        case 2:
          if (!DAI) return;
          await (await DAI.faucet()).wait();
          break;
        case 3:
          if (!USDC) return;
          await (await USDC.faucet()).wait();
          break;
        case 4:
          if (!USDT) return;
          await (await USDT.faucet()).wait();
          break;
        case 5:
          if (!TUSD) return;
          await (await TUSD.faucet()).wait();
          break;
      }
    },
    [DAI, TUSD, USDC, USDT, WETH]
  );
  const mintNFT = useCallback(
    async (nft: number) => {
      switch (nft) {
        case 0:
          if (!E721) return;
          await (await E721.faucet()).wait();
          break;
        case 1:
          if (!E721B) return;
          await (await E721B.faucet()).wait();
          break;
        case 2:
          if (!E1155) return;
          // @ts-ignore
          await (await E1155.faucet(10)).wait();
          break;
        case 3:
          if (!E1155B) return;
          // @ts-ignore
          await (await E1155B.faucet(10)).wait();
          break;
        default:
          debug("unknown NFT");
          return;
      }
    },
    [E721, E721B, E1155, E1155B]
  );
  return {
    mintE20,
    mintNFT,
  };
};
