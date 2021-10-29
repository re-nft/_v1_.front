// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";
import fetch from "node-fetch";
import { enableMapSet } from "immer";
enableMapSet();

beforeAll(() => {
  jest.spyOn(global.console, "error").mockImplementation(() => {});
  jest.spyOn(global.console, "log").mockImplementation(() => {});
  jest.spyOn(global.console, "warn").mockImplementation(() => {});
});

beforeEach(() => {
  global.console.log.mockClear();
  global.console.error.mockClear();
  global.console.warn.mockClear();
});

afterEach(() => {
  expect(global.console.log).not.toHaveBeenCalled();
  //TODO hooks are clearing error, not sure why
  if (global.console.error.mock)
    expect(global.console.error).not.toHaveBeenCalled();
  expect(global.console.warn).not.toHaveBeenCalled();
});

afterAll(() => {
  global.console.log.mockRestore();
  //TODO hooks are clearing error, not sure why
  if (global.console.error.mock) global.console.error.mockRestore();
  global.console.warn.mockRestore();
});

if (!global.fetch) {
  global.fetch = fetch;
}
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
