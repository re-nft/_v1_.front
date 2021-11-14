export declare global {
  interface Window {
    ethereum?: {
      on: (eventName: string, fn: (params?: unknown) => void) => void;
      off: (eventName: string, fn: (params?: unknown) => void) => void;
      removeListener: (eventName: string, fn: () => void) => void;
      isMetaMask?: boolean;
    };
    web3?: Record<string, unknown>;
  }
}
