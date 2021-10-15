import { renderHook, waitFor } from "@testing-library/react-hooks";
import { useWallet } from "renft-front/hooks/store/useWallet";

jest.mock("firebase/app");
jest.mock("react-ga");
jest.mock("@ethersproject/providers");
jest.mock("web3modal");

describe("dev features are disabled for mainnet", () => {
  it("should not use react-redux tools", () => {});
  it("should load from dev rpc", () => {});
  it("should disable mint", () => {});
});
describe("mainnet has the bellow enabled", () => {
  describe("should log react-ga", () => {});
  describe("should log the following errors to sentry", () => {});
});
