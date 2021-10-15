import { renderHook, waitFor } from "@testing-library/react-hooks";
import { useWallet } from "renft-front/hooks/store/useWallet";

jest.mock("firebase/app");
jest.mock("react-ga");
jest.mock("@ethersproject/providers");
jest.mock("web3modal");

describe("Catalouge item", () => {
  it("should show image loading skeleton", () => {
    expect(true).toBe(false);
  });
  it("should show image", () => {
    expect(true).toBe(false);
  });
  it("should show video", () => {
    expect(true).toBe(false);
  });
  it("should show no img default", () => {
    expect(true).toBe(false);
  });

  it("should show pending transaction status", () => {
    expect(true).toBe(false);
  });
  it("should show opensea link", () => {
    expect(true).toBe(false);
  });
  it("should show rarible link", () => {
    expect(true).toBe(false);
  });
  it("should show verified", () => {
    expect(true).toBe(false);
  });
  it("button should be disabled when no wallet", () => {
    expect(true).toBe(false);
  });
  it("button should be disabled when not selected", () => {
    expect(true).toBe(false);
  });
  it("button should be disabled when disabled by parent component", () => {
    expect(true).toBe(false);
  });
  it("should show copy link ", () => {
    expect(true).toBe(false);
  });
});
