import { renderHook, waitFor } from "@testing-library/react-hooks";
import { useWallet } from "renft-front/hooks/store/useWallet";

jest.mock("firebase/app");
jest.mock("react-ga");
jest.mock("@ethersproject/providers");
jest.mock("web3modal");

xdescribe("Layout", () => {
  it("should header", () => {
    expect(true).toBe(false);
  });
  it("should show empty content", () => {
    expect(true).toBe(false);
  });
  it("should show searchable result", () => {
    expect(true).toBe(false);
  });
  it("should show result count", () => {
    expect(true).toBe(false);
  });
  it("should show filter bar", () => {
    expect(true).toBe(false);
  });

  it("should show footer", () => {
    expect(true).toBe(false);
  });
});
