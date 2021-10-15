import { renderHook, waitFor } from "@testing-library/react-hooks";
import { useWallet } from "renft-front/hooks/store/useWallet";

jest.mock("firebase/app");
jest.mock("react-ga");
jest.mock("@ethersproject/providers");
jest.mock("web3modal");

describe("Filter test", () => {
  describe("based on collection", () => {
    it("should show everthing by default", () => {
      expect(true).toBe(false);
    });
    it("should empty result", () => {
      expect(true).toBe(false);
    });
    it("should filtered matched", () => {
      expect(true).toBe(false);
    });
  });
});
