import abis, { NetworkSpecificAbis } from "./abis";
import addresses, { NetworkSpecificAddresses } from "./addresses";

export const getAll = (
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

export { abis, addresses };

export { NetworkSpecificAbis, NetworkSpecificAddresses };
