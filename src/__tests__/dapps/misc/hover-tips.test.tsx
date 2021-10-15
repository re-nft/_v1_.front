import { renderHook, waitFor } from "@testing-library/react-hooks";
import { useWallet } from "renft-front/hooks/store/useWallet";

jest.mock("firebase/app");
jest.mock("react-ga");
jest.mock("@ethersproject/providers");
jest.mock("web3modal");

describe("Hover tips", () => {
  it("should show hover message", () => {
    expect(true).toBe(false);
  });
  it("should not show hover message when disabled", () => {
    expect(true).toBe(false);
  });
});
