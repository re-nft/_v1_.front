import { renderHook, waitFor } from "@testing-library/react-hooks";
import { useWallet } from "renft-front/hooks/store/useWallet";

jest.mock("firebase/app");
jest.mock("react-ga");
jest.mock("@ethersproject/providers");
jest.mock("web3modal");

describe("dev features are disabled for mainnet", () => {
  it("should not use react-redux tools", () => {
    expect(true).toBe(false);
  });
  it("should not load from dev rpc", () => {
    expect(true).toBe(false);
  });
  it("should disable mint", () => {
    expect(true).toBe(false);
  });
});
describe("mainnet has the bellow enabled", () => {
  describe("should log react-ga", () => {
    it("should log claim", () => {
      expect(true).toBe(false);
    });
    it("should log lend", () => {
      expect(true).toBe(false);
    });
    it("should log rent", () => {
      expect(true).toBe(false);
    });
    it("should log stop lend", () => {
      expect(true).toBe(false);
    });

    it("should log return item", () => {
      expect(true).toBe(false);
    });
    it("should not log signature denied", () => {
      expect(true).toBe(false);
    });
  });
  describe("should log the following errors to sentry", () => {
    it("should log fetch errors", () => {
      expect(true).toBe(false);
    });
    it("should log parse errors", () => {
      expect(true).toBe(false);
    });
    it("should log missing tokenURI", () => {
      expect(true).toBe(false);
    });
  });
});
