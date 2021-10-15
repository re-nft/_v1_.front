import { renderHook, waitFor } from "@testing-library/react-hooks";
import { useWallet } from "renft-front/hooks/store/useWallet";

jest.mock("firebase/app");
jest.mock("react-ga");
jest.mock("@ethersproject/providers");
jest.mock("web3modal");

describe("User is renting not connected", () => {
  it("should show connect wallet message", () => {
    expect(true).toBe(false);
  });
});
