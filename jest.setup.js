// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";
import fetch from "node-fetch";
import { enableMapSet } from "immer";
enableMapSet();

if (!global.fetch) {
  global.fetch = fetch;
}

const ENABLE_LOG = false;
beforeAll(() => {
  if (ENABLE_LOG)
    jest.spyOn(global.console, "log").mockImplementation(() => {
      //nothing
    });
  jest.spyOn(global.console, "error").mockImplementation(() => {
    //nothing
  });
  jest.spyOn(global.console, "warn").mockImplementation(() => {
    //nothing
  });
});

beforeEach(() => {
  if (ENABLE_LOG) global.console.log.mockClear();
  global.console.error.mockClear();
  global.console.warn.mockClear();
});

afterEach(() => {
  if (ENABLE_LOG) expect(global.console.log).not.toHaveBeenCalled();
  //TODO hook tests are clearing the error mock, not sure why
  if (global.console.error.mock)
    expect(global.console.error).not.toHaveBeenCalled();
  expect(global.console.warn).not.toHaveBeenCalled();
});

afterAll(() => {
  if (ENABLE_LOG) global.console.log.mockRestore();
  //TODO hook tests are clearing the error mock, not sure why
  if (global.console.error.mock) global.console.error.mockRestore();
  global.console.warn.mockRestore();
});

jest.mock("firebase/app");
jest.mock("react-ga");
jest.mock("@ethersproject/providers");
jest.mock("web3modal");
jest.mock("next/router");
jest.mock("@renft/sdk");
jest.mock("renft-front/hooks/store/useWallet", () => {
  return {
    __esModule: true,
    useWallet: jest.fn().mockReturnValue({
      signer: undefined,
    }),
  };
});
//jest.mock("zustand");
jest.mock("@sentry/nextjs", () => {
  return {
    __esModule: true,
    captureException: jest.fn(),
  };
});
jest.mock("@headlessui/react");
// do not validate address for tests
jest.mock("@ethersproject/address", () => {
  return {
    __esModule: true,
    getAddress: jest.fn().mockImplementation((a) => a),
  };
});

jest.mock("renft-front/utils", () => {
  const actualModule = jest.requireActual("renft-front/utils");
  return {
    __esModule: true,
    ...actualModule,
    getContractWithProvider: jest.fn().mockReturnValue({
      balanceOf: jest.fn().mockReturnValue(Promise.resolve(2)),
    }),
    getContractWithSigner: jest.fn().mockResolvedValue({
      isApprovedForAll: jest.fn().mockResolvedValue(true),
    }),
  };
});
jest.mock("renft-front/hooks/contract/useSmartContracts");
let OLD_ENV;
beforeAll(() => {
  OLD_ENV = { ...process.env };
  //TODO:eniko this needs to be backward compatible
  process.env.NEXT_PUBLIC_OPENSEA_API_KEY = "https://api.opensea";
  process.env.NEXT_PUBLIC_RENFT_API = "https://renftapi";
  process.env.NEXT_PUBLIC_EIP721_API = "https://eip721";
  process.env.NEXT_PUBLIC_EIP1155_API = "https://eip1155";
  process.env.NEXT_PUBLIC_NETWORK_SUPPORTED = "mainnet";
  process.env.NEXT_PUBLIC_CORS_PROXY = "https://dummy-cors-proxy";
  process.env.NEXT_PUBLIC_PROVIDER_URL = "infura";
  process.env.NEXT_PUBLIC_CHAIN_ID = 1;
  process.env.NEXT_PUBLIC_SHOW_MINT = false;
  process.env.NEXT_PUBLIC_FETCH_NFTS_DEV = undefined;
  process.env.NEXT_PUBLIC_DEBUG = undefined;
  Object.defineProperty(global.window, "IntersectionObserver", {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    })),
  });
});

afterAll(() => {
  process.env = OLD_ENV;
});
import { waitFor } from "@testing-library/react";
import { rest } from "msw";

const uniswapRequest = () => {
  return rest.post(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          data: {
            bundles: [
              {
                ethPriceUSD: 1,
              },
            ],
          },
        })
      );
    }
  );
};

global.mockResponse = (options) => {
  const { renftapi, openseaapi, eip1155api, eip721api } = Object.assign(
    {},
    {
      renftapi: {
        status: 200,
        json: {},
      },
      openseaapi: {
        status: 200,
        json: {},
      },
      eip721api: {
        status: 200,
        json: {},
      },
      eip1155api: {
        status: 200,
        json: {},
      },
    },
    options
  );
  return [
    rest.options(process.env.NEXT_PUBLIC_RENFT_API, (req, res, ctx) => {
      return res(ctx.status(200));
    }),
    rest.post(process.env.NEXT_PUBLIC_RENFT_API, (req, res, ctx) => {
      // Respond with "500 Internal Server Error" status for this test.
      return res(ctx.status(renftapi.status), ctx.json(renftapi.json));
    }),
    rest.get("https://api.opensea.io/api/v1/assets", (req, res, ctx) => {
      return res(ctx.status(openseaapi.status), ctx.json(openseaapi.json));
    }),
    rest.post(process.env.NEXT_PUBLIC_EIP721_API, (req, res, ctx) => {
      // Respond with "500 Internal Server Error" status for this test.
      return res(ctx.status(eip721api.status), ctx.json(eip721api.json));
    }),
    rest.post(process.env.NEXT_PUBLIC_EIP1155_API, (req, res, ctx) => {
      // Respond with "500 Internal Server Error" status for this test.
      return res(ctx.status(eip1155api.status), ctx.json(eip1155api.json));
    }),

    uniswapRequest(),
    // catch all for ipfs data
    rest.get("*", (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          image: null,
          description: "",
          name: "",
        })
      );
    }),
  ];
};

global.waitForRefetch = async (screen) => {
  // wait for refetch to complete
  await waitFor(() => {
    expect(screen.queryByTestId("list-loader")).toBeInTheDocument();
  });
  await waitFor(
    () => {
      expect(screen.queryByTestId("list-loader")).not.toBeInTheDocument();
    },
    { timeout: 2000 }
  );
};
