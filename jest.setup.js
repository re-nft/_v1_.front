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
    jest.spyOn(global.console, "log").mockImplementation(() => {});
  jest.spyOn(global.console, "error").mockImplementation(() => {});
  jest.spyOn(global.console, "warn").mockImplementation(() => {});
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
//jest.mock("zustand");
jest.mock("@sentry/nextjs", () => {
  return {
    __esModule: true,
    captureException: jest.fn(),
  };
});
jest.mock("@headlessui/react");

let OLD_ENV;
beforeAll(() => {
  OLD_ENV = { ...process.env };
  //TODO:eniko this needs to be backward compatible
  process.env.NEXT_PUBLIC_OPENSEA_API = "https://api.opensea";
  process.env.NEXT_PUBLIC_OPENSEA_API_KEY = "https://api.opensea";
  process.env.NEXT_PUBLIC_RENFT_API = "https://renftapi";
  process.env.NEXT_PUBLIC_EIP721_API = "https://eip721";
  process.env.NEXT_PUBLIC_EIP1155_API = "https://eip1155";
  process.env.NEXT_PUBLIC_NETWORK_SUPPORTED = "mainnet";
  process.env.NEXT_PUBLIC_CORS_PROXY = "https://dummy-cors-proxy";
  process.env.NEXT_PUBLIC_SHOW_MINT = false;
  process.env.NEXT_PUBLIC_FETCH_NFTS_DEV = undefined;
  process.env.NEXT_PUBLIC_DEBUG = undefined;
});

afterAll(() => {
  process.env = OLD_ENV;
});
