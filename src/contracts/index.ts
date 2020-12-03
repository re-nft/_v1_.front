import abis from "./abis";
import addresses from "./addresses";
import { NetworkSpecificAbis, NetworkSpecificAddresses } from "./types";
import { PaymentToken } from "../types";

const getAll = (
  networkName: string
): {
  addresses: NetworkSpecificAddresses;
  abis: NetworkSpecificAbis;
} | null => {
  const resolvedNetworkName = networkName.trim().toLowerCase();

  switch (resolvedNetworkName) {
    case "goerli":
      return { addresses: addresses.goerli, abis: abis.goerli };
    default:
      console.error(`unknown network: ${resolvedNetworkName}`);
      return null;
  }
};

const toPaymentToken: (v: string) => PaymentToken = (v: string) => {
  switch (v.toLowerCase()) {
    case "0":
      return PaymentToken.DAI;
    case "1":
      return PaymentToken.USDC;
    case "2":
      return PaymentToken.USDT;
    case "3":
      return PaymentToken.TUSD;
    case "4":
      return PaymentToken.ETH;
    case "5":
      return PaymentToken.UNI;
    case "6":
      return PaymentToken.YFI;
    case "7":
      return PaymentToken.NAZ;
    default:
      return PaymentToken.NAZ;
  }
};

const toUnpackedPrice: (v: number | string) => number = (v) => {
  const resolvedV = typeof v === "string" ? Number(v) : v;

  // decimal part cannot exceed 9999
  // smallest whole part when converted from hex to decimal is 0x00010000 i.e. 65536

  let hexPrice = resolvedV.toString(16);
  if (hexPrice.length > 8) {
    console.error("unknown price");
    return resolvedV;
  } else {
    for (let i = 0; i < 8 - hexPrice.length; i++) {
      hexPrice = `0${hexPrice}`;
    }
  }
  const wholePart = parseInt(hexPrice.slice(0, 4), 16);
  const decimalPart = parseInt(hexPrice.slice(4, 8), 16);
  return Number(`${wholePart}.${decimalPart}`);
};

export { abis, addresses, getAll, toPaymentToken, toUnpackedPrice };
